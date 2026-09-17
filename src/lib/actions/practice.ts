"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { formatCorrectAnswer } from "@/lib/quiz/format";
import { isPracticable, isPracticeCorrect } from "@/lib/quiz/practice";
import { PRACTICE_STYLES } from "@/lib/quiz/styles";

/**
 * The practice quiz this student may use, with its questions — the same
 * visibility rule as the quiz page (published, in a published course they're
 * enrolled in, lesson live if it has one), limited to practice styles so these
 * actions can never be pointed at a graded quiz.
 */
async function practiceQuizFor(studentId: string, quizId: string) {
  return db.quiz.findFirst({
    where: {
      id: quizId,
      status: "PUBLISHED",
      style: { in: PRACTICE_STYLES },
      chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId } } } },
      OR: [{ lessonId: null }, { lesson: { status: "PUBLISHED" } }],
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
}

export type PracticeCheckResult =
  | { error: string }
  | { correct: boolean; explanation: string; mastered: number; total: number; complete: boolean };

/**
 * Checks one practice answer and records it. Nothing here writes a Submission,
 * so practice can't reach a score. The explanation only comes back with a
 * right answer — after a wrong one the student asks for it deliberately, so
 * "try again" still means something.
 */
export async function checkPracticeAnswer(
  quizId: string,
  questionId: string,
  response: unknown
): Promise<PracticeCheckResult> {
  const t = await getT();
  const student = await requireStudent();
  const quiz = await practiceQuizFor(student.id, quizId);
  const question = quiz?.questions.find((q) => q.id === questionId);
  if (!quiz || !question || !isPracticable(question)) return { error: t("practice.unavailable") };

  const practicable = quiz.questions.filter(isPracticable);
  const correct = isPracticeCorrect(question, response);
  const existing = await db.practiceProgress.findUnique({
    where: { studentId_quizId: { studentId: student.id, quizId } },
  });

  // Only questions still in the quiz count, so one deleted since can't block completion.
  const before = new Set(existing?.masteredIds ?? []);
  const wasComplete = practicable.every((q) => before.has(q.id));
  const after = new Set(before);
  if (correct) after.add(questionId);
  const masteredIds = practicable.filter((q) => after.has(q.id)).map((q) => q.id);
  const complete = masteredIds.length === practicable.length;
  const justCompleted = complete && !wasComplete;
  const now = new Date();

  await db.practiceProgress.upsert({
    where: { studentId_quizId: { studentId: student.id, quizId } },
    create: { studentId: student.id, quizId, masteredIds, completedAt: complete ? now : null, runs: complete ? 1 : 0 },
    update: {
      masteredIds,
      ...(justCompleted ? { runs: { increment: 1 }, completedAt: existing?.completedAt ?? now } : {}),
    },
  });

  // A finished run changes the completion marks on lists and the syllabus;
  // an ordinary answer doesn't, so it skips the refresh.
  if (justCompleted) {
    revalidatePath("/quizzes");
    revalidatePath("/courses", "layout");
    revalidatePath("/dashboard");
  }

  return {
    correct,
    explanation: correct ? question.explanation : "",
    mastered: masteredIds.length,
    total: practicable.length,
    complete,
  };
}

export type PracticeSolution = { error: string } | { explanation: string; answer: string };

/** The worked answer, on request after a wrong attempt. */
export async function revealPracticeSolution(quizId: string, questionId: string): Promise<PracticeSolution> {
  const t = await getT();
  const student = await requireStudent();
  const quiz = await practiceQuizFor(student.id, quizId);
  const question = quiz?.questions.find((q) => q.id === questionId);
  if (!quiz || !question) return { error: t("practice.unavailable") };
  return {
    explanation: question.explanation,
    answer: formatCorrectAnswer(question.type, question.correctAnswer, question.options),
  };
}

/**
 * Starts a fresh run. The completion mark and the count of finished runs stay:
 * practising again shouldn't take away that it was done.
 */
export async function restartPractice(quizId: string): Promise<{ error?: string }> {
  const t = await getT();
  const student = await requireStudent();
  const quiz = await practiceQuizFor(student.id, quizId);
  if (!quiz) return { error: t("practice.unavailable") };
  await db.practiceProgress.updateMany({
    where: { studentId: student.id, quizId },
    data: { masteredIds: [] },
  });
  revalidatePath(`/quizzes/${quizId}`);
  return {};
}
