/**
 * Builds the competition course for Kelas 7 from scripts/content/komp7-*.ts:
 * one chapter per item of the semifinal syllabus, each with a practice set,
 * and a closing "Simulasi Kompetisi" chapter holding Paket I and II of the
 * Penyisihan, Semifinal and Final rounds. The book's chapter PDFs are added
 * as lessons later.
 *
 *   npx tsx scripts/setup-komp7.ts validate   offline: content parses against the app's Zod schemas
 *   npx tsx scripts/setup-komp7.ts plan       read-only: what apply would create
 *   npx tsx scripts/setup-komp7.ts apply      creates what is missing
 *
 * The database is shared with production, so apply is safe to re-run: the
 * course and chapters are reused by title, an existing quiz is never touched
 * (it may hold submissions), and nothing is deleted. The course is created as
 * a DRAFT with nobody enrolled — publish and enrol when ready.
 *
 * Answers are checked separately: python3 scripts/check-komp7.py
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { questionRow, type ChapterContent } from "./content/math-types";
import { KOMP7_LATIHAN } from "./content/komp7-latihan";
import { KOMP7_SIMULASI } from "./content/komp7-simulasi";

// Placeholder until the competition's name is confirmed; renaming later is a one-field edit in the app.
const COURSE_TITLE = "Persiapan Kompetisi Matematika SMP — Kelas 7";
const COURSE_DESCRIPTION =
  "Persiapan kompetisi matematika kelas 7 sesuai kisi-kisi: latihan untuk setiap materi, serta simulasi babak penyisihan, semifinal, dan final (Paket I dan II).";

const CHAPTERS: ChapterContent[] = [...KOMP7_LATIHAN, KOMP7_SIMULASI];

const mode = process.argv[2] ?? "plan";

function validate() {
  const problems: string[] = [];
  const titles = new Set<string>();
  for (const chapter of CHAPTERS) {
    console.log(`\n${chapter.chapterTitle}`);
    for (const quiz of chapter.quizzes) {
      if (titles.has(quiz.title)) problems.push(`duplicate quiz title: ${quiz.title}`);
      titles.add(quiz.title);
      const total = quiz.questions.reduce((n, q) => n + q.points, 0);
      const worked = quiz.questions.filter((q) => q.type === "WORKED").length;
      if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && total !== 100) problems.push(`${quiz.title}: worth ${total} points, not 100`);
      if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && !quiz.settings?.timeLimitMinutes) problems.push(`${quiz.title}: needs a time limit`);
      if (quiz.style === "EXAM" && quiz.settings?.maxAttempts !== 1) problems.push(`${quiz.title}: an exam is one attempt`);
      if (quiz.style === "MASTERY" && worked > 0) problems.push(`${quiz.title}: practice can't hold WORKED questions`);
      for (const [i, q] of quiz.questions.entries()) {
        const at = `${quiz.title} #${i + 1}`;
        try {
          questionRow(q);
        } catch (e) {
          problems.push(`${at}: ${(e as Error).message}`);
        }
        if (q.type === "MULTIPLE_CHOICE" && q.options.length !== 4) problems.push(`${at}: needs 4 options`);
        if (q.type === "MULTIPLE_CHOICE" && new Set(q.options).size !== q.options.length) problems.push(`${at}: duplicate options`);
        if (q.type === "WORKED") {
          const scheme = (q.answerMarks ?? 1) + q.rubric.reduce((n, r) => n + r.marks, 0);
          if (scheme !== q.points) problems.push(`${at}: marking scheme totals ${scheme}, question is worth ${q.points}`);
          if (!q.solution.trim()) problems.push(`${at}: WORKED needs a model solution`);
        }
      }
      console.log(`  ${quiz.style.padEnd(8)} ${quiz.title.padEnd(52)} ${String(quiz.questions.length).padStart(2)} soal / ${String(total).padStart(3)} poin${worked ? ` · ${worked} uraian` : ""}`);
    }
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
  if (mode !== "plan" && mode !== "apply") throw new Error(`unknown mode "${mode}" — use validate | plan | apply`);

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const tutor = await db.user.findFirstOrThrow({ where: { role: "TUTOR" }, select: { id: true, name: true } });
    const existing = await db.course.findFirst({
      where: { title: COURSE_TITLE },
      include: { chapters: { orderBy: { order: "asc" }, include: { quizzes: { select: { title: true } } } } },
    });

    console.log(`\ncourse: ${COURSE_TITLE} — ${existing ? "exists" : "will be created as DRAFT"} (owner ${tutor.name})`);
    for (const [i, spec] of CHAPTERS.entries()) {
      const live = existing?.chapters.find((c) => c.title === spec.chapterTitle);
      const missing = spec.quizzes.filter((q) => !live?.quizzes.some((l) => l.title === q.title)).length;
      console.log(`  ${String(i + 1).padStart(2)}. ${spec.chapterTitle.padEnd(40)} ${live ? "exists" : "new"} · ${missing} quiz(zes) to create`);
    }
    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    const course =
      existing ??
      (await db.course.create({
        data: {
          title: COURSE_TITLE,
          description: COURSE_DESCRIPTION,
          subject: "Mathematics",
          level: "SMP Kelas 7",
          curriculum: "Kompetisi",
          status: "DRAFT",
          ownerId: tutor.id,
        },
        include: { chapters: { orderBy: { order: "asc" }, include: { quizzes: { select: { title: true } } } } },
      }));

    const created = { chapters: 0, quizzes: 0 };
    for (const [order, spec] of CHAPTERS.entries()) {
      let chapter = course.chapters.find((c) => c.title === spec.chapterTitle);
      if (!chapter) {
        chapter = { ...(await db.chapter.create({ data: { courseId: course.id, title: spec.chapterTitle, order } })), quizzes: [] };
        created.chapters++;
      }
      for (const quiz of spec.quizzes) {
        if (chapter.quizzes.some((q) => q.title === quiz.title)) continue;
        await db.quiz.create({
          data: {
            chapterId: chapter.id,
            lessonId: null,
            title: quiz.title,
            status: "PUBLISHED",
            style: quiz.style,
            ...quiz.settings,
            questions: {
              create: quiz.questions.map((q, i) => ({ order: i, prompt: q.prompt, points: q.points, explanation: q.explanation, ...questionRow(q) })),
            },
          },
        });
        created.quizzes++;
      }
    }
    console.log(`\n✓ ${created.chapters} chapter(s), ${created.quizzes} quiz(zes) created.`);
    console.log("  The course is a DRAFT: publish it and enrol the student when you're ready.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
