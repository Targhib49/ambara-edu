/**
 * Adds the three-level path ("Jalur Bertingkat", from the Junior Path modules)
 * to the front of each topic chapter of the olympiad course, turning the MS²C
 * course into the general "Persiapan Olimpiade Matematika SMP".
 *
 *   npx tsx scripts/setup-olim-levels.ts validate   offline: content parses, PDFs exist, drills exist
 *   npx tsx scripts/setup-olim-levels.ts plan       read-only: what apply would create
 *   npx tsx scripts/setup-olim-levels.ts apply      creates the level lessons and quizzes as DRAFT
 *   npx tsx scripts/setup-olim-levels.ts publish    renames the course and publishes what apply created
 *
 * Each chapter becomes: Level 1 → Level 2 → Level 3 (new), then the existing
 * MS²C sessions and closing tests, then a Review Campuran (new). The database
 * is shared with production and the course is live with students in it, so:
 *   - apply writes everything as DRAFT, invisible to students until publish
 *   - existing lessons are only moved down (order + 3), never edited
 *   - existing quizzes, submissions and progress are never touched
 *   - a level lesson or quiz that already exists (matched by title) is skipped
 *   - nothing is ever deleted, except an uploaded PDF whose lesson failed to save
 *
 * Answers are checked separately: python3 scripts/check-olim-levels.py
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { DRILL_SKILLS } from "../src/lib/drills/registry";
import { questionRow, type ChapterQuiz, type Question } from "./content/math-types";
import type { LevelChapter } from "./content/olim-levels-types";
import { LV_ALJABAR } from "./content/olim-lv-alj";
import { LV_TEORI_BILANGAN } from "./content/olim-lv-tb";
import { LV_KOMBINATORIKA } from "./content/olim-lv-kom";
import { LV_GEOMETRI } from "./content/olim-lv-geo";

const FORMER_TITLE = "Persiapan Olimpiade Matematika (MS²C)";
const COURSE_TITLE = "Persiapan Olimpiade Matematika SMP";
const COURSE_DESCRIPTION =
  "Persiapan olimpiade matematika SMP: aljabar, teori bilangan, kombinatorika, dan geometri. Setiap bab dimulai dengan tiga level — dari materi sekolah sampai OSN provinsi — lalu sesi pendalaman, try out, dan simulasi final dengan soal uraian yang dinilai dari prosesnya.";

const LEVEL_CHAPTERS: LevelChapter[] = [LV_ALJABAR, LV_TEORI_BILANGAN, LV_KOMBINATORIKA, LV_GEOMETRI];

const BOOK_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku");
const BACKUP_DIR = path.join(BOOK_DIR, "backups");
const BUCKET = "attachments";
const pdfPath = (dir: string) => path.join(BOOK_DIR, dir, `${dir}.pdf`);

const mode = process.argv[2] ?? "plan";

const dollarsBalanced = (text: string) => (text.match(/(?<!\\)\$/g) ?? []).length % 2 === 0;

/** Texts shown with MathText (may hold $…$) and texts shown plain (must not). */
function texts(q: Question): { math: string[]; plain: string[] } {
  const math = [q.prompt, q.explanation];
  const plain: string[] = [];
  if (q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") math.push(...q.options);
  if (q.type === "STEPS") plain.push(...q.steps.map((s) => s.prompt));
  if (q.type === "MULTI_PART") plain.push(...q.parts.map((p) => p.prompt));
  if (q.type === "FIND_MISTAKE") plain.push(...q.lines);
  if (q.type === "WORKED") math.push(q.solution, ...q.rubric.map((r) => r.point));
  return { math, plain };
}

function checkQuiz(quiz: ChapterQuiz, problems: string[]) {
  const worked = quiz.questions.filter((q) => q.type === "WORKED").length;
  if ((quiz.style === "MASTERY" || quiz.style === "DRILL" || quiz.style === "REVIEW") && worked) problems.push(`${quiz.title}: practice can't hold WORKED`);
  if ((quiz.style === "DRILL" || quiz.style === "REVIEW") && quiz.questions.length) problems.push(`${quiz.title}: ${quiz.style} takes no questions`);
  if ((quiz.style === "MASTERY" || quiz.style === "CLASSIC") && !quiz.questions.length) problems.push(`${quiz.title}: no questions`);
  if (quiz.style === "DRILL" && !(quiz.settings?.drillSkill && quiz.settings.drillSkill in DRILL_SKILLS)) problems.push(`${quiz.title}: unknown drill skill ${quiz.settings?.drillSkill}`);
  if (quiz.style === "CLASSIC") {
    const total = quiz.questions.reduce((n, q) => n + q.points, 0);
    if (total !== 100) problems.push(`${quiz.title}: worth ${total}, not 100`);
  }
  for (const [i, q] of quiz.questions.entries()) {
    const at = `${quiz.title} #${i + 1}`;
    try {
      questionRow(q);
    } catch (e) {
      problems.push(`${at}: ${(e as Error).message}`);
    }
    const { math, plain } = texts(q);
    for (const t of math) if (!dollarsBalanced(t)) problems.push(`${at}: unbalanced $ in "${t.slice(0, 50)}…"`);
    for (const t of plain) if (t.includes("$") || t.includes("\\")) problems.push(`${at}: LaTeX in plain text "${t.slice(0, 50)}…"`);
    if (q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") {
      if (q.options.length < 2 || q.options.length > 4) problems.push(`${at}: needs 2–4 options`);
      if (new Set(q.options).size !== q.options.length) problems.push(`${at}: duplicate options`);
      for (const l of q.type === "MULTIPLE_CHOICE" ? [q.answer] : q.answer) if ("ABCD".indexOf(l) >= q.options.length) problems.push(`${at}: answer ${l} out of range`);
    }
    if (q.type === "WORKED") {
      const marks = q.answerMarks ?? 1;
      if (marks === 0 && q.answer.trim()) problems.push(`${at}: a stated answer with no marks for it`);
      if (marks > 0 && !q.answer.trim()) problems.push(`${at}: marks for an answer the question never asks for`);
      if (marks + q.rubric.reduce((n, r) => n + r.marks, 0) !== q.points) problems.push(`${at}: marking scheme doesn't total the points`);
      if (!q.solution.trim()) problems.push(`${at}: WORKED needs a model solution`);
    }
  }
}

function validate() {
  const problems: string[] = [];
  const titles = new Set<string>();
  let questions = 0;
  for (const chapter of LEVEL_CHAPTERS) {
    console.log(`\n${chapter.chapterTitle}`);
    for (const level of chapter.levels) {
      if (!fs.existsSync(pdfPath(level.pdfDir))) problems.push(`${level.title}: missing ${pdfPath(level.pdfDir)}`);
      const size = fs.existsSync(pdfPath(level.pdfDir)) ? `${Math.round(fs.statSync(pdfPath(level.pdfDir)).size / 1024)} KB` : "?";
      console.log(`  ${level.title}  (PDF ${size})`);
      for (const quiz of level.quizzes) {
        if (titles.has(quiz.title)) problems.push(`duplicate quiz title ${quiz.title}`);
        titles.add(quiz.title);
        checkQuiz(quiz, problems);
        questions += quiz.questions.length;
        const worked = quiz.questions.filter((q) => q.type === "WORKED").length;
        console.log(`     ${quiz.style.padEnd(8)} ${quiz.title.padEnd(58)} ${String(quiz.questions.length).padStart(2)} soal${worked ? ` · ${worked} uraian` : ""}`);
      }
    }
    for (const quiz of chapter.closing) {
      if (titles.has(quiz.title)) problems.push(`duplicate quiz title ${quiz.title}`);
      titles.add(quiz.title);
      checkQuiz(quiz, problems);
      console.log(`  ${quiz.style.padEnd(8)} ${quiz.title} (chapter, after the closing tests)`);
    }
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
  console.log(`\n✓ content valid — ${titles.size} quizzes, ${questions} questions`);
}

function quizData(chapterId: string, lessonId: string | null, quiz: ChapterQuiz) {
  return {
    chapterId,
    lessonId,
    title: quiz.title,
    status: "DRAFT" as const,
    style: quiz.style,
    ...quiz.settings,
    questions: {
      create: quiz.questions.map((q, order) => ({ order, prompt: q.prompt, points: q.points, explanation: q.explanation, ...questionRow(q) })),
    },
  };
}

async function main() {
  validate();
  if (mode === "validate") return;
  if (!["plan", "apply", "publish"].includes(mode)) throw new Error(`unknown mode "${mode}" — use validate | plan | apply | publish`);

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const course = await db.course.findFirst({
      where: { title: { in: [COURSE_TITLE, FORMER_TITLE] } },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" }, include: { quizzes: { select: { id: true, title: true, status: true } } } },
            quizzes: { where: { lessonId: null }, select: { id: true, title: true, status: true } },
          },
        },
      },
    });
    if (!course) throw new Error(`course "${FORMER_TITLE}" not found`);
    console.log(`\ncourse: ${course.title} (${course.status})`);

    const levelTitles = new Set(LEVEL_CHAPTERS.flatMap((c) => c.levels.map((l) => l.title)));
    for (const spec of LEVEL_CHAPTERS) {
      const chapter = course.chapters.find((c) => c.title === spec.chapterTitle);
      if (!chapter) throw new Error(`chapter "${spec.chapterTitle}" not found`);
      const others = chapter.lessons.filter((l) => !levelTitles.has(l.title));
      console.log(`  ${spec.chapterTitle}: ${others.length} existing lesson(s) stay, first at order ${others[0]?.order ?? "–"}`);
      for (const level of spec.levels) {
        const live = chapter.lessons.find((l) => l.title === level.title);
        const missing = level.quizzes.filter((q) => !live?.quizzes.some((x) => x.title === q.title)).length;
        console.log(`     ${level.title.padEnd(46)} ${live ? `exists (${live.status})` : "to create"} · ${missing} quiz(zes) to create`);
      }
      for (const quiz of spec.closing) console.log(`     ${quiz.title.padEnd(46)} ${chapter.quizzes.some((q) => q.title === quiz.title) ? "exists" : "to create"}`);
    }

    if (mode === "plan") {
      console.log("\nplan only — nothing changed.");
      return;
    }

    if (mode === "publish") {
      const counts = { lessons: 0, quizzes: 0 };
      for (const spec of LEVEL_CHAPTERS) {
        const chapter = course.chapters.find((c) => c.title === spec.chapterTitle)!;
        for (const level of spec.levels) {
          const lesson = chapter.lessons.find((l) => l.title === level.title);
          if (!lesson) throw new Error(`${level.title} is missing — run apply first`);
          if (lesson.status !== "PUBLISHED") {
            await db.lesson.update({ where: { id: lesson.id }, data: { status: "PUBLISHED" } });
            counts.lessons++;
          }
          const ours = lesson.quizzes.filter((q) => level.quizzes.some((x) => x.title === q.title) && q.status === "DRAFT");
          if (ours.length) counts.quizzes += (await db.quiz.updateMany({ where: { id: { in: ours.map((q) => q.id) } }, data: { status: "PUBLISHED" } })).count;
        }
        const closing = chapter.quizzes.filter((q) => spec.closing.some((x) => x.title === q.title) && q.status === "DRAFT");
        if (closing.length) counts.quizzes += (await db.quiz.updateMany({ where: { id: { in: closing.map((q) => q.id) } }, data: { status: "PUBLISHED" } })).count;
      }
      await db.course.update({ where: { id: course.id }, data: { title: COURSE_TITLE, description: COURSE_DESCRIPTION, curriculum: "Olimpiade" } });
      console.log(`\n✓ published ${counts.lessons} lesson(s) and ${counts.quizzes} quiz(zes); course renamed to "${COURSE_TITLE}".`);
      return;
    }

    // apply
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backup = path.join(BACKUP_DIR, `olim-levels-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(backup, JSON.stringify(course, null, 2));
    console.log(`\nbackup → ${backup}`);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const created = { lessons: 0, quizzes: 0, moved: 0 };

    for (const spec of LEVEL_CHAPTERS) {
      const chapter = course.chapters.find((c) => c.title === spec.chapterTitle)!;
      const others = chapter.lessons.filter((l) => !levelTitles.has(l.title));

      // Make room for orders 0–2, once: the existing sessions move down together.
      if (others.length && others[0].order < spec.levels.length) {
        await db.$transaction(others.map((l) => db.lesson.update({ where: { id: l.id }, data: { order: l.order + spec.levels.length } })));
        created.moved += others.length;
      }

      for (const [order, level] of spec.levels.entries()) {
        let lesson = chapter.lessons.find((l) => l.title === level.title);
        if (!lesson) {
          const id = randomUUID();
          const bytes = fs.readFileSync(pdfPath(level.pdfDir));
          const storagePath = `${id}/${randomUUID()}-${level.pdfName}`;
          const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf" });
          if (error) throw new Error(`upload ${level.pdfName}: ${error.message}`);
          try {
            const fresh = await db.lesson.create({
              data: {
                id,
                chapterId: chapter.id,
                title: level.title,
                order,
                status: "DRAFT",
                blocks: {
                  create: [
                    { order: 0, type: "MARKDOWN", data: blockDataSchemas.MARKDOWN.parse({ markdown: level.intro }) },
                    {
                      order: 1,
                      type: "FILE_ATTACHMENT",
                      data: blockDataSchemas.FILE_ATTACHMENT.parse({ storagePath, fileName: level.pdfName, mimeType: "application/pdf", sizeBytes: bytes.length, display: "inline" }),
                    },
                  ],
                },
              },
            });
            lesson = { ...fresh, quizzes: [] };
            created.lessons++;
          } catch (e) {
            await supabase.storage.from(BUCKET).remove([storagePath]);
            throw e;
          }
        }
        // One after another, so createdAt keeps the intended order in the lesson.
        for (const quiz of level.quizzes) {
          if (lesson.quizzes.some((q) => q.title === quiz.title)) continue;
          await db.quiz.create({ data: quizData(chapter.id, lesson.id, quiz) });
          created.quizzes++;
        }
      }

      for (const quiz of spec.closing) {
        if (chapter.quizzes.some((q) => q.title === quiz.title)) continue;
        await db.quiz.create({ data: quizData(chapter.id, null, quiz) });
        created.quizzes++;
      }
    }

    console.log(`\n✓ ${created.lessons} lesson(s) and ${created.quizzes} quiz(zes) created as DRAFT; ${created.moved} existing lesson(s) moved down.`);
    console.log("  Review them in the tutor view, then run `publish`.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
