/**
 * Adds Intermediate Math · Bab 1's closing sequence (scripts/content/math-bab1-chapter.ts):
 * 2 practices → 2 try-outs (standar + pengayaan) → 1 exam, all chapter-level.
 *
 *   npx tsx scripts/setup-math-bab1-chapter.ts validate   offline: every answer parses, points add up
 *   npx tsx scripts/setup-math-bab1-chapter.ts plan       read-only: what exists, what would be created
 *   npx tsx scripts/setup-math-bab1-chapter.ts apply      creates the five quizzes as DRAFT
 *   npx tsx scripts/setup-math-bab1-chapter.ts publish    publishes them and archives the old try-out, in one transaction
 *
 * Chapter-level quizzes are listed by createdAt, so apply stamps them one
 * second apart in the content's order. The old "Try Out — Bab 1: Bilangan Bulat"
 * predates the book remake (it tests pangkat and nilai mutlak, outside Sesi 1–5);
 * publish archives it the house way — DRAFT, "[Arsip] " title — so its
 * submission is kept.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseCorrectAnswer } from "../src/lib/quiz/schema";
import { DRILL_SKILLS } from "../src/lib/drills/registry";
import { CHAPTER_QUIZZES, type ChapterQuestion } from "./content/math-bab1-chapter";

const BACKUP_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku/backups");
const OLD_TRYOUT = "Try Out — Bab 1: Bilangan Bulat";
const mode = process.argv[2] ?? "plan";

function row(q: ChapterQuestion) {
  switch (q.type) {
    case "MULTIPLE_CHOICE":
      return { options: q.options, correctAnswer: parseCorrectAnswer("MULTIPLE_CHOICE", { letter: q.answer }) };
    case "MULTI_SELECT":
      return { options: q.options, correctAnswer: parseCorrectAnswer("MULTI_SELECT", { letters: q.answer }) };
    case "NUMERIC":
      return { options: [], correctAnswer: parseCorrectAnswer("NUMERIC", { value: q.answer, tolerance: 0 }) };
    case "STEPS":
      return { options: [], correctAnswer: parseCorrectAnswer("STEPS", { steps: q.steps }) };
    case "MULTI_PART":
      return { options: [], correctAnswer: parseCorrectAnswer("MULTI_PART", { parts: q.parts }) };
    case "FIND_MISTAKE":
      return { options: [], correctAnswer: parseCorrectAnswer("FIND_MISTAKE", { lines: q.lines, wrongIndex: q.wrongIndex, correction: q.correction }) };
  }
}

function validate() {
  const problems: string[] = [];
  for (const quiz of CHAPTER_QUIZZES) {
    if (quiz.style === "DRILL") {
      if (quiz.questions.length) problems.push(`${quiz.title}: a drill has no authored questions`);
      if (!quiz.settings?.drillSkill || !(quiz.settings.drillSkill in DRILL_SKILLS)) problems.push(`${quiz.title}: unknown drill skill`);
    } else if (!quiz.questions.length) problems.push(`${quiz.title}: no questions`);
    if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && !quiz.settings?.timeLimitMinutes) problems.push(`${quiz.title}: needs a time limit`);
    if (quiz.style === "EXAM" && quiz.settings?.maxAttempts !== 1) problems.push(`${quiz.title}: an exam is one attempt`);
    quiz.questions.forEach((q, i) => {
      const at = `${quiz.title} #${i + 1}`;
      try {
        row(q);
      } catch (e) {
        problems.push(`${at}: ${(e as Error).message}`);
      }
      if (!(q.points > 0)) problems.push(`${at}: points must be > 0`);
      if (/[$\\]/.test(q.prompt)) problems.push(`${at}: prompt looks like LaTeX (plain text only)`);
      if (q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") {
        if (q.options.length < 2 || q.options.length > 4) problems.push(`${at}: needs 2–4 options`);
        const letters = q.type === "MULTIPLE_CHOICE" ? [q.answer] : q.answer;
        for (const l of letters) if ("ABCD".indexOf(l) >= q.options.length) problems.push(`${at}: answer ${l} out of range`);
        if (quiz.settings?.randomizeQuestionOrder && q.options.some((o) => /\b(pilihan|opsi) [A-D]\b|\b[A-D] dan [A-D]\b/.test(o)))
          problems.push(`${at}: an option refers to another by letter, which breaks when options are shuffled`);
      }
    });
    const total = quiz.questions.reduce((n, q) => n + q.points, 0);
    const types = [...new Set(quiz.questions.map((q) => q.type))].join(", ");
    console.log(`  ${quiz.style.padEnd(8)} ${quiz.title.padEnd(46)} ${String(quiz.questions.length).padStart(2)} soal · ${String(total).padStart(3)} poin  ${types}`);
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
  console.log("\n✓ content valid");
}

async function main() {
  validate();
  if (mode === "validate") return;
  if (!["plan", "apply", "publish"].includes(mode)) throw new Error(`unknown mode "${mode}" — use validate | plan | apply | publish`);

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const course = await db.course.findFirstOrThrow({ where: { title: { contains: "Intermediate Math", mode: "insensitive" } } });
    const chapter = await db.chapter.findFirstOrThrow({ where: { courseId: course.id, title: "Bab 1: Bilangan Bulat" } });
    const existing = await db.quiz.findMany({
      where: { chapterId: chapter.id, lessonId: null },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { submissions: true, questions: true } } },
    });
    console.log(`\n${course.title} · ${chapter.title} — chapter-level quizzes now:`);
    for (const q of existing) console.log(`  ${q.status.padEnd(9)} ${q.style.padEnd(8)} ${q.title} (${q._count.questions} soal, ${q._count.submissions} submissions)`);

    const titles = CHAPTER_QUIZZES.map((q) => q.title);
    const mine = existing.filter((q) => titles.includes(q.title));
    const oldTryout = existing.find((q) => q.title === OLD_TRYOUT);

    if (mode === "plan") {
      if (mine.length) console.log(`\nalready created: ${mine.map((q) => `${q.title} (${q.status})`).join(", ")}`);
      else console.log(`\napply would create, in this order, as DRAFT:\n  ${titles.join("\n  ")}`);
      console.log(`publish would publish them${oldTryout ? ` and archive "${OLD_TRYOUT}" (${oldTryout._count.submissions} submission kept)` : ""}.`);
      return;
    }

    if (mode === "apply") {
      if (mine.length) throw new Error(`already created (${mine.map((q) => q.title).join(", ")}) — not running twice`);
      const base = Date.now();
      for (const [i, quiz] of CHAPTER_QUIZZES.entries()) {
        await db.quiz.create({
          data: {
            chapterId: chapter.id,
            lessonId: null,
            title: quiz.title,
            style: quiz.style,
            status: "DRAFT",
            createdAt: new Date(base + i * 1000),
            ...quiz.settings,
            questions: {
              create: quiz.questions.map((q, order) => ({
                order,
                type: q.type,
                prompt: q.prompt,
                points: q.points,
                explanation: q.explanation,
                ...row(q),
              })),
            },
          },
        });
        console.log(`✓ created DRAFT ${quiz.style} ${quiz.title}`);
      }
      console.log("\nReview them under Tutor → Quizzes, then run `publish`.");
      return;
    }

    // publish
    if (mine.length !== CHAPTER_QUIZZES.length) throw new Error(`expected ${CHAPTER_QUIZZES.length} quizzes from apply, found ${mine.length}`);
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    if (oldTryout) {
      const full = await db.quiz.findUniqueOrThrow({ where: { id: oldTryout.id }, include: { questions: { orderBy: { order: "asc" } } } });
      const file = path.join(BACKUP_DIR, `bab1-old-tryout-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      fs.writeFileSync(file, JSON.stringify(full, null, 2));
      console.log(`backup → ${file}`);
    }
    await db.$transaction([
      db.quiz.updateMany({ where: { id: { in: mine.map((q) => q.id) } }, data: { status: "PUBLISHED" } }),
      ...(oldTryout ? [db.quiz.update({ where: { id: oldTryout.id }, data: { status: "DRAFT", title: `[Arsip] ${OLD_TRYOUT}` } })] : []),
    ]);
    console.log(`✓ published ${mine.length} quizzes${oldTryout ? `, archived "${OLD_TRYOUT}"` : ""}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
