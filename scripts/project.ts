/**
 * Guided projects, from a definition file to the course. See
 * docs/project-authoring.md for the file format.
 *
 *   npx tsx scripts/project.ts validate <file>    run every step's solution; no database
 *   npx tsx scripts/project.ts plan <file>        what apply/publish would change
 *   npx tsx scripts/project.ts apply <file>       create the project as a DRAFT
 *        [--replace-draft]                        …replacing a draft of it nobody has opened
 *   npx tsx scripts/project.ts publish <file>     publish it and archive the quizzes it replaces
 *   npx tsx scripts/project.ts sync <file>        update wording, hints and the answer key, even once published
 *        [--dry-run]                              …listing what would change, writing nothing
 *
 * The database is shared with production, so apply and publish refuse to run
 * on a project that doesn't validate, and write a JSON backup first.
 */
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { pathToFileURL } from "url";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  CHECK_FILE,
  ENTRY_FILE,
  projectDefinitionSchema,
  toStoredStep,
  walkSteps,
  type ProjectDefinition,
} from "../src/lib/projects/definition";
import { projectStepSchema, type ProjectStep } from "../src/lib/projects/schema";

const ARCHIVE_PREFIX = "[Arsip] ";
const RUN_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------- loading

async function loadDefinition(file: string): Promise<ProjectDefinition> {
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const parsed = projectDefinitionSchema.safeParse(mod.default ?? mod.project);
  if (!parsed.success) {
    console.error(`✗ ${file} doesn't match the project format:`);
    for (const issue of parsed.error.issues) console.error(`   ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    process.exit(1);
  }
  return parsed.data;
}

// ---------------------------------------------------------------- running Python

/** The app's comparison: trailing spaces per line and trailing blank lines don't count. */
function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
}

/**
 * Runs a project the way the student's browser does: main.py with the input on
 * stdin — or, for a check with a script, that script beside the files instead.
 */
function runPython(files: Record<string, string>, input: string, script?: string): { output: string; error: string | null } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ambara-project-"));
  try {
    const all = script ? { ...files, [CHECK_FILE]: script } : files;
    for (const [name, text] of Object.entries(all)) {
      const full = path.join(dir, name);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, text);
    }
    const result = spawnSync("python3", [script ? CHECK_FILE : ENTRY_FILE], {
      cwd: dir,
      input,
      encoding: "utf8",
      timeout: RUN_TIMEOUT_MS,
      env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONDONTWRITEBYTECODE: "1" },
    });
    if (result.error) return { output: result.stdout ?? "", error: String(result.error.message) };
    if (result.status !== 0) {
      const lines = (result.stderr ?? "").trim().split("\n").filter(Boolean);
      return { output: result.stdout ?? "", error: lines[lines.length - 1] ?? `exit code ${result.status}` };
    }
    return { output: result.stdout ?? "", error: null };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

type RunCheck = { label: string; input: string; expected: string; output: string; error: string | null; passed: boolean };

function checkRuns(
  files: Record<string, string>,
  runs: { input: string; expectedOutput: string; script?: string; label?: string }[]
): RunCheck[] {
  return runs.map((run, i) => {
    const { output, error } = runPython(files, run.input, run.script);
    return {
      label: i === 0 ? "example" : run.script ? `check "${run.label || `script ${i}`}"` : `hidden test ${i}`,
      input: run.input,
      expected: run.expectedOutput,
      output,
      error,
      passed: !error && normalize(output) === normalize(run.expectedOutput),
    };
  });
}

function showMismatch(c: RunCheck) {
  const indent = (s: string) => s.split("\n").map((l) => `        | ${l}`).join("\n");
  console.log(`      ✗ ${c.label} — input:\n${indent(c.input || "(none)")}`);
  if (c.error) console.log(`        stopped with: ${c.error}`);
  console.log(`        expected:\n${indent(normalize(c.expected))}`);
  console.log(`        solution printed:\n${indent(normalize(c.output))}`);
}

// ---------------------------------------------------------------- validate

/**
 * Every step, walked as a student would with the reference solutions: the
 * solution must pass the step's example and every hidden test. Warnings flag
 * steps that would pass with no work, or whose hidden tests can't catch a
 * hard-coded answer.
 */
function validate(def: ProjectDefinition): boolean {
  const pythonCheck = spawnSync("python3", ["--version"], { encoding: "utf8" });
  if (pythonCheck.status !== 0) {
    console.error("✗ python3 isn't available; validate needs it to run the solutions.");
    process.exit(1);
  }
  console.log(`Validating "${def.title}" — ${def.steps.length} steps, checked with ${pythonCheck.stdout.trim()}\n`);

  let ok = true;
  let warnings = 0;
  for (const state of walkSteps(def)) {
    const { step, start, done, index } = state;
    const runs = [step.example, ...step.tests];
    const results = checkRuns(done, runs);
    const passed = results.every((r) => r.passed);
    const scripts = step.tests.filter((t) => t.script).length;
    console.log(
      `  ${passed ? "✓" : "✗"} ${index + 1}. [${step.stage}] ${step.title} — ${step.points} pt, ` +
        `${step.tests.length - scripts} input test(s), ${scripts} function check(s)`
    );
    if (!passed) {
      ok = false;
      results.filter((r) => !r.passed).forEach(showMismatch);
    }

    for (const test of step.tests) {
      if (test.script && !test.label) {
        warnings++;
        console.log("      ⚠ a function check has no label — the student would see only \"cek fungsi\" when it fails");
      }
    }
    if (step.tests.length === 0) {
      warnings++;
      console.log("      ⚠ no hidden tests — printing the example's output by hand would pass");
    } else if (runs.every((r) => normalize(r.expectedOutput) === normalize(step.example.expectedOutput))) {
      warnings++;
      console.log("      ⚠ every test expects the same output as the example — a hard-coded answer would pass");
    }

    const before = checkRuns(start, runs);
    if (before.every((r) => r.passed)) {
      warnings++;
      console.log("      ⚠ the step already passes with the files it starts from — it asks for no work");
    }
    for (const name of Object.keys(step.solution)) {
      if (!(name in start)) console.log(`      · the solution creates ${name} (the student has to make this file)`);
    }
  }
  console.log(`\n${ok ? "✓ every step's solution passes its checks" : "✗ some solutions fail their checks"}${warnings ? ` — ${warnings} warning(s)` : ""}`);
  return ok;
}

// ---------------------------------------------------------------- database

function database() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
}

type Db = ReturnType<typeof database>;

async function locate(db: Db, def: ProjectDefinition) {
  const courses = await db.course.findMany({ where: { title: def.course }, select: { id: true, title: true } });
  if (courses.length !== 1) throw new Error(`expected exactly one course titled "${def.course}", found ${courses.length}`);
  const chapters = await db.chapter.findMany({
    where: { courseId: courses[0].id, title: def.chapter },
    include: {
      lessons: { select: { id: true, title: true } },
      quizzes: {
        include: { _count: { select: { submissions: true, submissionAttempts: true, projectProgress: true } } },
      },
    },
  });
  if (chapters.length !== 1) throw new Error(`expected exactly one chapter titled "${def.chapter}", found ${chapters.length}`);
  const chapter = chapters[0];

  let lessonId: string | null = null;
  if (def.afterLesson) {
    const lesson = chapter.lessons.find((l) => l.title === def.afterLesson);
    if (!lesson) throw new Error(`no lesson titled "${def.afterLesson}" in the chapter`);
    lessonId = lesson.id;
  }

  const replaced = def.replaces.map((title) => {
    const live = chapter.quizzes.find((q) => q.title === title);
    const archived = chapter.quizzes.find((q) => q.title === ARCHIVE_PREFIX + title);
    return { title, live, archived };
  });
  const existing = chapter.quizzes.find((q) => q.title === def.title) ?? null;
  // Each step's lesson link, by title, within the chapter.
  const stepLessonIds = def.steps.map((step) => {
    if (!step.lesson) return undefined;
    const lesson = chapter.lessons.find((l) => l.title === step.lesson);
    if (!lesson) throw new Error(`step "${step.title}" links to "${step.lesson}", which isn't a lesson in the chapter`);
    return lesson.id;
  });
  return { course: courses[0], chapter, lessonId, replaced, existing, stepLessonIds };
}

function backup(label: string, data: unknown) {
  const dir = path.resolve("backups/projects");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${label}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

async function plan(def: ProjectDefinition) {
  const db = database();
  try {
    const where = await locate(db, def);
    const points = def.steps.reduce((n, s) => n + s.points, 0);
    const stages = [...new Set(def.steps.map((s) => s.stage))];
    console.log(`Course:   ${where.course.title}`);
    console.log(`Chapter:  ${where.chapter.title}`);
    console.log(`Project:  "${def.title}" — ${stages.length} stages, ${def.steps.length} steps, ${points} points`);
    console.log(`          placed ${def.afterLesson ? `after "${def.afterLesson}"` : "at the end of the chapter"}`);
    console.log(`          starts with: ${Object.keys(def.files).join(", ")}`);
    console.log(`          lesson links: ${where.stepLessonIds.filter(Boolean).length} of ${def.steps.length} steps`);
    if (where.existing) {
      const c = where.existing._count;
      console.log(
        `          ⚠ a quiz with this title already exists (${where.existing.status}, ${c.projectProgress} student(s) started, ${c.submissions} submission(s))`
      );
    }
    console.log(`\nOn publish, archived (kept with their results, hidden from students):`);
    if (where.replaced.length === 0) console.log("   (nothing)");
    for (const r of where.replaced) {
      if (r.live) {
        console.log(`   • ${r.title} — ${r.live.status}, ${r.live._count.submissions} submission(s), ${r.live._count.submissionAttempts} earlier attempt(s)`);
      } else if (r.archived) {
        console.log(`   • ${r.title} — already archived`);
      } else {
        console.log(`   ✗ ${r.title} — not found in the chapter`);
      }
    }
  } finally {
    await db.$disconnect();
  }
}

async function apply(def: ProjectDefinition, replaceDraft: boolean) {
  const db = database();
  try {
    const where = await locate(db, def);
    if (where.existing) {
      const c = where.existing._count;
      const untouched = where.existing.status === "DRAFT" && c.projectProgress === 0 && c.submissions === 0;
      if (!replaceDraft || !untouched) {
        throw new Error(
          untouched
            ? `"${def.title}" already exists as a draft — pass --replace-draft to rebuild it`
            : `"${def.title}" already exists and is ${where.existing.status} or has students' work — refusing to replace it`
        );
      }
      const file = backup("replaced-draft", await db.quiz.findUnique({ where: { id: where.existing.id }, include: { questions: true } }));
      console.log(`Backed up the old draft to ${path.relative(process.cwd(), file)}`);
      await db.quiz.delete({ where: { id: where.existing.id } });
    }

    const quiz = await db.quiz.create({
      data: {
        title: def.title,
        chapterId: where.chapter.id,
        lessonId: where.lessonId,
        status: "DRAFT",
        style: "PROJECT",
        projectFiles: def.files,
        questions: {
          create: def.steps.map((step, order) => ({
            order,
            type: "PROJECT_STEP" as const,
            prompt: step.instruction,
            points: step.points,
            explanation: "",
            options: [],
            correctAnswer: toStoredStep(step, where.stepLessonIds[order]),
          })),
        },
      },
    });
    console.log(`✓ Created "${def.title}" as a DRAFT (${def.steps.length} steps) — quiz ${quiz.id}`);
    console.log(`  Try it at /tutor/quizzes/${quiz.id}/preview, then run publish.`);
  } finally {
    await db.$disconnect();
  }
}

async function publish(def: ProjectDefinition) {
  const db = database();
  try {
    const where = await locate(db, def);
    if (!where.existing) throw new Error(`"${def.title}" doesn't exist yet — run apply first`);
    const missing = where.replaced.filter((r) => !r.live && !r.archived);
    if (missing.length) throw new Error(`can't find: ${missing.map((r) => r.title).join(", ")}`);
    const toArchive = where.replaced.flatMap((r) => (r.live ? [r.live] : []));

    const file = backup("publish", {
      project: { id: where.existing.id, status: where.existing.status },
      archived: toArchive.map((q) => ({ id: q.id, title: q.title, status: q.status, lessonId: q.lessonId })),
    });
    console.log(`Backed up the quizzes about to change to ${path.relative(process.cwd(), file)}`);

    await db.$transaction([
      db.quiz.update({ where: { id: where.existing.id }, data: { status: "PUBLISHED" } }),
      // Archived the way the Bab 1 remake did: a draft, detached from its lesson,
      // renamed — its submissions and attempt history stay attached.
      ...toArchive.map((q) =>
        db.quiz.update({ where: { id: q.id }, data: { status: "DRAFT", lessonId: null, title: ARCHIVE_PREFIX + q.title } })
      ),
    ]);
    console.log(`✓ Published "${def.title}" and archived ${toArchive.length} quiz(zes).`);
  } finally {
    await db.$disconnect();
  }
}

/**
 * Brings an existing project — even a published one with students in it — up
 * to date with the file in everything a student isn't checked against: the
 * instructions, hints, lesson links, and the tutor's answer key. The steps
 * must be the same ones in the same order, and every step's example, hidden
 * checks, added files and points must be unchanged; anything else needs a new
 * project, not an update under students' feet.
 */
async function sync(def: ProjectDefinition, dryRun: boolean) {
  const db = database();
  try {
    const where = await locate(db, def);
    if (!where.existing) throw new Error(`"${def.title}" doesn't exist yet — run apply first`);
    const questions = await db.question.findMany({
      where: { quizId: where.existing.id, type: "PROJECT_STEP" },
      orderBy: { order: "asc" },
      select: { id: true, prompt: true, points: true, correctAnswer: true },
    });
    if (questions.length !== def.steps.length) {
      throw new Error(`the stored project has ${questions.length} steps and the file ${def.steps.length} — the steps changed, so sync can't update it`);
    }
    const checked = (step: ProjectStep) => JSON.stringify([step.example, step.tests, step.addFiles]);
    const updates = questions.map((q, i) => {
      const fileStep = def.steps[i];
      // Read through the schema, so defaults fill in the same way on both sides.
      const parsed = projectStepSchema.safeParse(q.correctAnswer);
      if (!parsed.success) throw new Error(`step ${i + 1} is stored in a shape that doesn't parse`);
      const stored = parsed.data;
      const next = toStoredStep(fileStep, where.stepLessonIds[i]);
      if (stored.title !== fileStep.title) {
        throw new Error(`step ${i + 1} is "${stored.title}" in the database but "${fileStep.title}" in the file — the steps changed`);
      }
      if (checked(stored) !== checked(next) || q.points !== fileStep.points) {
        throw new Error(`step ${i + 1} ("${fileStep.title}") changes what students are checked against or its points — that needs a new project`);
      }
      const changed = [
        q.prompt !== fileStep.instruction && "instruction",
        JSON.stringify([stored.hint, stored.hints]) !== JSON.stringify([next.hint, next.hints]) && "hints",
        stored.lessonId !== next.lessonId && "lesson link",
        JSON.stringify(stored.solution) !== JSON.stringify(next.solution) && "answer key",
      ].filter(Boolean);
      return { id: q.id, title: fileStep.title, changed, prompt: fileStep.instruction, correctAnswer: next };
    });

    const toWrite = updates.filter((u) => u.changed.length);
    for (const u of toWrite) console.log(`  • ${u.title}: ${u.changed.join(", ")}`);
    if (!toWrite.length) return console.log("Nothing to update — the project already matches the file.");
    if (dryRun) return console.log("(dry run — nothing written)");

    const file = backup("sync", { quizId: where.existing.id, questions });
    console.log(`Backed up the steps to ${path.relative(process.cwd(), file)}`);
    // All or nothing, with room for a slow connection to the shared database.
    await db.$transaction(
      async (tx) => {
        for (const u of toWrite) await tx.question.update({ where: { id: u.id }, data: { prompt: u.prompt, correctAnswer: u.correctAnswer } });
      },
      { timeout: 60_000 }
    );
    console.log(`✓ Updated ${toWrite.length} step(s) of "${def.title}" (${where.existing.status}).`);
  } finally {
    await db.$disconnect();
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const [command, file, ...flags] = process.argv.slice(2);
  if (!command || !file || !["validate", "plan", "apply", "publish", "sync"].includes(command)) {
    console.error("usage: npx tsx scripts/project.ts <validate|plan|apply|publish|sync> <definition file> [--replace-draft]");
    process.exit(2);
  }
  const def = await loadDefinition(file);
  if (command === "validate") process.exit(validate(def) ? 0 : 1);
  if (command === "plan") return plan(def);
  // Nothing reaches the shared database unless every solution passes.
  if (!validate(def)) {
    console.error("\nRefusing to write a project whose solutions fail their checks.");
    process.exit(1);
  }
  console.log();
  if (command === "apply") return apply(def, flags.includes("--replace-draft"));
  if (command === "sync") return sync(def, flags.includes("--dry-run"));
  return publish(def);
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
