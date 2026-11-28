/**
 * Builds one step-by-step chapter of Basic Python from a unit in
 * scripts/content/ (see python-stepwise.ts for the block kinds):
 *   --unit if     python-if.ts    "Percabangan: Langkah demi Langkah"
 *   --unit loop   python-loop.ts  "Perulangan: Langkah demi Langkah"
 *
 *   npx tsx scripts/setup-python-stepwise.ts validate --unit loop          runs every program, checks every step; no database
 *   npx tsx scripts/setup-python-stepwise.ts plan --unit loop              validate + what apply would do (read-only)
 *   npx tsx scripts/setup-python-stepwise.ts apply --unit loop             adds the chapter, all lessons DRAFT
 *   npx tsx scripts/setup-python-stepwise.ts apply --unit loop --replace   rebuilds the chapter's lessons if it already exists
 *   npx tsx scripts/setup-python-stepwise.ts publish --unit loop           publishes the chapter's draft lessons
 *   options: --course "<title>" (default "Basic Python"), --create-course (local testing: makes a DRAFT course)
 *
 * Runs against whatever `.env` points at — the local stack. For the live site:
 *   npm run prod -- npx tsx scripts/setup-python-stepwise.ts plan --unit loop
 *
 * Every output on the page comes from running the code with Python 3.12, the
 * version Pyodide 0.26 ships, so error messages read exactly as students will
 * see them. Validation fails (and nothing is written) when:
 *   - an example or a fix raises, or a "mistake" neither raises nor is shown wrong
 *   - a trace's predict options don't contain the real output exactly once
 *   - a guided step's solution fails its own code checks, or the previous
 *     step's program already passes it (every step must ask for something)
 *   - a "try" starter doesn't run, or a block fails its schema
 *
 * Lessons are added as DRAFT. `--replace` refuses if any lesson in the chapter
 * has a quiz attached or a student's saved guided-exercise progress.
 */
import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas, type BlockDataMap } from "../src/lib/blocks/schema";
import { failedCodeChecks } from "../src/lib/blocks/guided";
import { codeTracerProps } from "../src/lib/viz/schemas";
import type { BlockSource, Unit } from "./content/python-stepwise";
import { PYTHON_IF } from "./content/python-if";
import { PYTHON_LOOP } from "./content/python-loop";

const UNITS: Record<string, Unit> = { if: PYTHON_IF, loop: PYTHON_LOOP };

const PYTHON = process.env.PYTHON ?? "/opt/homebrew/bin/python3.12";
const TRACE_PY = path.resolve(__dirname, "content/trace.py");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "python-if-"));

type Built = { type: keyof BlockDataMap; data: unknown };
type Run = { stdout: string; stderr: string; error: string | null; line: number | null };

const problems: string[] = [];
const fail = (where: string, message: string) => problems.push(`${where}: ${message}`);

/** Judge-style comparison, same as the app's normalizeOutput. */
const norm = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");

let runCount = 0;
/** Runs a program like Pyodide does in the app: stdin piped, nothing echoed. */
function run(code: string, stdin = ""): Run {
  const file = path.join(TMP, `main${runCount++}.py`);
  fs.writeFileSync(file, code + "\n");
  const r = spawnSync(PYTHON, ["-I", file], { input: stdin, encoding: "utf8", timeout: 10_000 });
  const stderr = r.stderr ?? "";
  const lastLine = stderr.trim().split("\n").pop() ?? "";
  const lines = [...stderr.matchAll(/line (\d+)/g)];
  return {
    stdout: r.stdout ?? "",
    stderr,
    error: r.status === 0 ? null : lastLine || `exit ${r.status}`,
    line: lines.length ? Number(lines[lines.length - 1][1]) : null,
  };
}

/** Records a trace (input echoed, like a terminal). */
function trace(code: string, stdin = "", notes: Record<number, string> = {}) {
  const r = spawnSync(PYTHON, ["-I", TRACE_PY], { input: JSON.stringify({ code, stdin, notes }), encoding: "utf8", timeout: 10_000 });
  if (r.status !== 0) throw new Error(`trace.py failed: ${r.stderr}`);
  return JSON.parse(r.stdout) as { steps: { line: number; vars: [string, string][]; output: string; note: string }[]; output: string; error: string | null };
}

const fence = (lang: string, body: string) => "```" + lang + "\n" + body.replace(/\n+$/, "") + "\n```";
const outputBlock = (output: string) => (norm(output) === "" ? "_(tidak ada output)_" : fence("text", norm(output)));

function buildBlock(lesson: string, src: BlockSource, index: number): Built[] {
  const where = `${lesson} › block ${index + 1} (${src.kind})`;
  switch (src.kind) {
    case "md":
      return [{ type: "MARKDOWN", data: { markdown: src.text } }];

    case "example": {
      const t = trace(src.code, src.stdin ?? "");
      if (t.error) fail(where, `example raised ${t.error}`);
      const parts = [src.lead ?? "", fence("python", src.code)];
      if (src.stdin) parts.push(`_Misalnya kamu mengetik: ${src.stdin.trim().split("\n").join(", ")}_`);
      parts.push("**Output:**", outputBlock(t.output));
      return [{ type: "MARKDOWN", data: { markdown: parts.filter(Boolean).join("\n\n") } }];
    }

    case "mistake": {
      const bad = run(src.code, src.stdin ?? "");
      const fixed = run(src.fix, src.stdin ?? "");
      if (fixed.error) fail(where, `fix raised ${fixed.error}`);
      if (!bad.error && norm(bad.stdout) === norm(fixed.stdout)) fail(where, "the broken code neither raises nor prints anything different from the fix");
      const result = bad.error
        ? ["**Yang muncul:**", fence("text", bad.line ? `Error di baris ${bad.line}:\n${bad.error}` : bad.error)]
        : ["**Output-nya** (tanpa error, tapi salah):", outputBlock(bad.stdout)];
      const fixedOut = norm(fixed.stdout) ? ["", fence("text", norm(fixed.stdout))] : [];
      return [
        {
          type: "MARKDOWN",
          data: {
            markdown: [`### ${src.title}`, "", fence("python", src.code), "", ...result, "", src.explain, "", "**Perbaikannya:**", "", fence("python", src.fix), ...fixedOut].join("\n"),
          },
        },
      ];
    }

    case "trace": {
      const t = trace(src.code, src.stdin ?? "", src.notes);
      if (t.error) fail(where, `trace raised ${t.error}`);
      let predict: { question: string; options: string[]; answer: number; explanation: string } | undefined;
      if (src.predict) {
        const real = norm(t.output);
        const matches = src.predict.options
          .map((o, i) => ({ i, o: o === "(tidak ada output)" ? "" : o }))
          .filter(({ o }) => norm(o) === real);
        if (matches.length !== 1) fail(where, `predict options match the real output ${matches.length} times; real output: ${JSON.stringify(real)}`);
        if (new Set(src.predict.options.map(norm)).size !== src.predict.options.length) fail(where, "predict options repeat");
        predict = { ...src.predict, answer: matches[0]?.i ?? 0 };
      }
      const props = { title: src.title, code: src.code, stdin: src.stdin ?? "", steps: t.steps, ...(predict ? { predict } : {}) };
      const parsed = codeTracerProps.safeParse(props);
      if (!parsed.success) fail(where, parsed.error.issues.map((i) => i.message).join("; "));
      return [{ type: "VISUALIZATION", data: { component: "code_tracer", props } }];
    }

    case "guided": {
      const steps = src.steps.map((step, i) => {
        const at = `${where} › step ${i + 1} "${step.title}"`;
        const stdin = step.stdin ?? "";
        const sol = run(step.solution, stdin);
        if (sol.error) fail(at, `solution raised ${sol.error}`);
        const expectedOutput = norm(sol.stdout);
        const own = failedCodeChecks(step.solution, step.codeChecks ?? [], "python");
        if (own.length) fail(at, `solution fails its own code checks: ${own.join(" | ")}`);
        // The program as the student has it when this step opens must not already pass.
        const before = i === 0 ? src.starterCode : src.steps[i - 1].solution;
        const prev = run(before, stdin);
        const prevPasses = !prev.error && norm(prev.stdout) === expectedOutput && failedCodeChecks(before, step.codeChecks ?? [], "python").length === 0;
        if (prevPasses) fail(at, "the program before this step already passes it");
        // Each solution must grow from the one before — a check for typos between steps.
        return {
          title: step.title,
          instructions: step.instructions,
          expectedOutput,
          stdin,
          hints: step.hints ?? [],
          codeChecks: step.codeChecks ?? [],
        };
      });
      const starter = run(src.starterCode, src.steps[0].stdin ?? "");
      if (starter.error) fail(where, `starter code raised ${starter.error}`);
      return [{ type: "GUIDED_CODE", data: { language: "python", title: src.title, intro: src.intro, starterCode: src.starterCode, steps } }];
    }

    case "try": {
      const starter = run(src.starterCode);
      if (starter.error) fail(where, `starter raised ${starter.error}`);
      if (/\binput\(/.test(src.starterCode)) fail(where, "the scratchpad has no input; don't call input() in a try starter");
      const sol = run(src.solution);
      if (sol.error) fail(where, `solution raised ${sol.error}`);
      return [
        {
          type: "MARKDOWN",
          data: { markdown: [`### ✏️ ${src.title}`, "", src.task, "", "**Target output:**", "", outputBlock(sol.stdout)].join("\n") },
        },
        { type: "CODE_EDITOR", data: { language: "python", starterCode: src.starterCode } },
      ];
    }
  }
}

function buildAll(unit: Unit) {
  const lessons = unit.lessons.map((lesson) => {
    const blocks = lesson.blocks.flatMap((b, i) => buildBlock(lesson.title, b, i));
    for (const [i, block] of blocks.entries()) {
      const parsed = blockDataSchemas[block.type].safeParse(block.data);
      if (!parsed.success) fail(`${lesson.title} › built block ${i + 1} (${block.type})`, parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; "));
      else block.data = parsed.data;
    }
    return { title: lesson.title, blocks };
  });
  return lessons;
}

function arg(name: string) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const mode = process.argv[2];
  const unit = UNITS[arg("--unit") ?? ""];
  if (!["validate", "plan", "apply", "publish"].includes(mode) || !unit) {
    console.log(`usage: setup-python-stepwise.ts validate | plan | apply [--replace] | publish  --unit ${Object.keys(UNITS).join("|")} [--course <title>] [--create-course]`);
    process.exit(1);
  }
  const CHAPTER_TITLE = unit.chapterTitle;
  if (mode === "publish") return publish(CHAPTER_TITLE);

  const lessons = buildAll(unit);
  const counts = lessons.map((l) => {
    const by = (t: string) => l.blocks.filter((b) => b.type === t).length;
    const guided = l.blocks.find((b) => b.type === "GUIDED_CODE")?.data as BlockDataMap["GUIDED_CODE"] | undefined;
    return `  ${l.title}: ${l.blocks.length} blocks (${by("VISUALIZATION")} trace, ${guided?.steps.length ?? 0} guided steps, ${by("CODE_EDITOR")} scratchpads)`;
  });
  console.log(`Built ${lessons.length} lessons, ${runCount} program runs:\n${counts.join("\n")}`);
  fs.rmSync(TMP, { recursive: true, force: true });
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log("✓ every program ran as stated, every step checked");
  if (mode === "validate") return;

  if (process.argv.includes("--dump")) {
    fs.writeFileSync(arg("--dump")!, JSON.stringify(lessons, null, 2));
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const courseTitle = arg("--course") ?? "Basic Python";
    let course = await db.course.findFirst({ where: { title: courseTitle }, select: { id: true, title: true, status: true } });
    if (!course && !process.argv.includes("--create-course")) {
      console.error(`No course titled "${courseTitle}". Pass --course "<title>", or --create-course to make a DRAFT one (local testing).`);
      process.exit(1);
    }
    const chapter = course
      ? await db.chapter.findFirst({
          where: { courseId: course.id, title: CHAPTER_TITLE },
          select: { id: true, lessons: { select: { id: true, title: true, _count: { select: { quizzes: true } }, blocks: { where: { type: "GUIDED_CODE" }, select: { _count: { select: { guidedProgress: true } } } } } } },
        })
      : null;
    const replace = process.argv.includes("--replace");

    console.log(`\nCourse: ${course ? `"${course.title}" (${course.status})` : `"${courseTitle}" — will be created as DRAFT`}`);
    if (chapter && !replace) {
      console.error(`Chapter "${CHAPTER_TITLE}" already exists. Pass --replace to rebuild its lessons.`);
      process.exit(1);
    }
    if (chapter) {
      const blocked = chapter.lessons.filter((l) => l._count.quizzes > 0 || l.blocks.some((b) => b._count.guidedProgress > 0));
      if (blocked.length) {
        console.error(`Refusing --replace: these lessons have quizzes or students' saved progress: ${blocked.map((l) => l.title).join(", ")}`);
        process.exit(1);
      }
      console.log(`Chapter exists: its ${chapter.lessons.length} lessons will be replaced.`);
    } else console.log(`Chapter "${CHAPTER_TITLE}" will be added at the end of the course.`);
    console.log(`${lessons.length} lessons, all DRAFT.`);
    if (mode === "plan") return;

    if (!course) {
      const tutor = await db.user.findFirst({ where: { role: "TUTOR" }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (!tutor) throw new Error("No tutor account to own the course");
      course = await db.course.create({
        data: { title: courseTitle, description: "Python dari nol.", subject: "Programming", status: "DRAFT", ownerId: tutor.id },
        select: { id: true, title: true, status: true },
      });
    }
    const courseId = course.id;
    await db.$transaction(
      async (tx) => {
        let chapterId = chapter?.id;
        if (chapterId) await tx.lesson.deleteMany({ where: { chapterId } });
        else {
          const last = await tx.chapter.findFirst({ where: { courseId }, orderBy: { order: "desc" }, select: { order: true } });
          chapterId = (await tx.chapter.create({ data: { courseId, title: CHAPTER_TITLE, order: (last?.order ?? -1) + 1 }, select: { id: true } })).id;
        }
        for (const [i, lesson] of lessons.entries()) {
          await tx.lesson.create({
            data: {
              chapterId,
              title: lesson.title,
              order: i,
              status: "DRAFT",
              blocks: { create: lesson.blocks.map((b, order) => ({ type: b.type, order, data: b.data as object })) },
            },
          });
        }
      },
      { timeout: 60_000 }
    );
    console.log(`✓ applied to "${course.title}".`);
  } finally {
    await db.$disconnect();
  }
}

/** Publishes the chapter's draft lessons — the tutor's call, after reviewing them. */
async function publish(chapterTitle: string) {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const courseTitle = arg("--course") ?? "Basic Python";
    const chapter = await db.chapter.findFirst({
      where: { title: chapterTitle, course: { title: courseTitle } },
      select: { id: true, course: { select: { status: true } }, lessons: { select: { title: true, status: true } } },
    });
    if (!chapter) {
      console.error(`No chapter "${chapterTitle}" in "${courseTitle}".`);
      process.exit(1);
    }
    const { count } = await db.lesson.updateMany({ where: { chapterId: chapter.id, status: "DRAFT" }, data: { status: "PUBLISHED" } });
    console.log(`✓ published ${count} lesson(s) of "${chapterTitle}" (${chapter.lessons.length} in the chapter). Course is ${chapter.course.status}.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
