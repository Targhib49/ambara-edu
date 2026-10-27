/**
 * One-off fix for "Simulasi Babak Final — Teori Bilangan" (MS²C course).
 *
 * The WORKED question on n(n+1)(n+2) + (n+1) shipped with finalAnswer "21",
 * but the quotient at n = 4 is (n+1)² = 25 — its own model solution says so.
 * setup-olim's `apply` never revisits an existing quiz, so the live row has to
 * be patched directly. This script:
 *   1. sets correctAnswer.finalAnswer to "25" and replaces the solution text
 *      with the cleaned-up one from scripts/content/olim-chapters.ts;
 *   2. re-grades every live submission of that quiz with the corrected key and
 *      updates autoScore where it changed. manualScore (the tutor's reviewed
 *      total) is never touched — reviewed submissions are listed instead.
 *
 * Usage: npx tsx scripts/fix-olim-tb-exam-key.ts          (dry run)
 *        npx tsx scripts/fix-olim-tb-exam-key.ts apply    (write)
 */
import "dotenv/config";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { aggregateSubmission, gradeQuestion } from "../src/lib/quiz/grading";
import { submissionAnswersSchema } from "../src/lib/quiz/schema";
import { OLIM_TEORI_BILANGAN_CHAPTER } from "./content/olim-chapters";

const COURSE_TITLE = "Persiapan Olimpiade Matematika (MS²C)";
const QUIZ_TITLE = "Simulasi Babak Final — Teori Bilangan";
const PROMPT_START = "Buktikan bahwa hasil kali tiga bilangan bulat berurutan ditambah bilangan tengahnya";

async function main() {
  const apply = process.argv[2] === "apply";
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

  const spec = OLIM_TEORI_BILANGAN_CHAPTER.quizzes
    .find((q) => q.title === QUIZ_TITLE)
    ?.questions.find((q) => q.prompt.startsWith(PROMPT_START));
  if (!spec || spec.type !== "WORKED") throw new Error("question not found in content");
  if (spec.answer !== "25") throw new Error(`content still says ${spec.answer}`);

  const quizzes = await db.quiz.findMany({
    where: { title: QUIZ_TITLE, chapter: { course: { title: COURSE_TITLE } } },
    include: { questions: true },
  });
  if (quizzes.length !== 1) throw new Error(`expected one live quiz, found ${quizzes.length}`);
  const quiz = quizzes[0];

  const question = quiz.questions.find((q) => q.type === "WORKED" && q.prompt.startsWith(PROMPT_START));
  if (!question) throw new Error("question not found in the live quiz");
  const current = question.correctAnswer as Record<string, unknown>;
  console.log(`Quiz ${quiz.id}\nQuestion ${question.id}: finalAnswer is "${current.finalAnswer}"`);

  const correctAnswer = { ...current, finalAnswer: "25", solution: spec.solution };

  // Re-grade with the corrected key before writing anything, so the dry run shows the effect.
  const patched = quiz.questions.map((q) => (q.id === question.id ? { ...q, correctAnswer } : q));
  const submissions = await db.submission.findMany({
    where: { quizId: quiz.id },
    include: { student: { select: { name: true, email: true } } },
  });
  console.log(`${submissions.length} live submission(s)`);

  const changes: { id: string; autoScore: number }[] = [];
  for (const sub of submissions) {
    const answers = submissionAnswersSchema.parse(sub.answers);
    const grades = patched.map((q) => gradeQuestion(q, answers.find((a) => a.questionId === q.id)?.response ?? null));
    const { autoScore } = aggregateSubmission(grades);
    const stated = answers.find((a) => a.questionId === question.id)?.response as { finalAnswer?: string } | undefined;
    const who = sub.student.name || sub.student.email;
    const reviewed = sub.manualScore !== null ? ` · reviewed, manualScore ${sub.manualScore} (left as is)` : "";
    console.log(`  ${who}: stated "${stated?.finalAnswer ?? ""}", autoScore ${sub.autoScore} → ${autoScore}${reviewed}`);
    if (autoScore !== sub.autoScore) changes.push({ id: sub.id, autoScore });
  }

  if (!apply) {
    console.log(`\nDry run. Would update the answer key and ${changes.length} autoScore(s). Re-run with "apply".`);
    await db.$disconnect();
    return;
  }

  await db.$transaction([
    db.question.update({ where: { id: question.id }, data: { correctAnswer: correctAnswer as Prisma.InputJsonValue } }),
    ...changes.map((c) => db.submission.update({ where: { id: c.id }, data: { autoScore: c.autoScore } })),
  ]);
  console.log(`\nUpdated the answer key and ${changes.length} autoScore(s).`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
