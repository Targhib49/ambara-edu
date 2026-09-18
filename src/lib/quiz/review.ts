import "server-only";
import { db } from "@/lib/db";
import { isPracticable } from "@/lib/quiz/practice";
import { seededPermutation } from "@/lib/quiz/shuffle";

export const REVIEW_COUNT_DEFAULT = 10;
export const REVIEW_COUNT_MAX = 30;

/**
 * The questions a review set may draw on: everything already written in
 * *earlier* chapters of the same course. Revisiting old material is the point,
 * and it also means a review can never spoil work the student hasn't reached.
 *
 * Drills are skipped (they have no written questions), as are other reviews —
 * a review of reviews would go in circles — and anything that can't be checked
 * instantly.
 */
export async function reviewPool(reviewQuizId: string) {
  const quiz = await db.quiz.findUnique({
    where: { id: reviewQuizId },
    select: { chapter: { select: { courseId: true, order: true } } },
  });
  if (!quiz?.chapter) return [];

  const questions = await db.question.findMany({
    where: {
      quiz: {
        status: "PUBLISHED",
        style: { notIn: ["DRILL", "REVIEW"] },
        chapter: { courseId: quiz.chapter.courseId, order: { lt: quiz.chapter.order } },
        OR: [{ lessonId: null }, { lesson: { status: "PUBLISHED" } }],
      },
    },
    select: {
      id: true,
      type: true,
      prompt: true,
      points: true,
      options: true,
      explanation: true,
      correctAnswer: true,
      quiz: { select: { title: true } },
    },
    orderBy: { id: "asc" },
  });
  return questions.filter(isPracticable);
}

/** One set for this run: `count` questions picked at random from the pool. */
export async function drawReviewSet(reviewQuizId: string, count: number, seed: string) {
  const pool = await reviewPool(reviewQuizId);
  const order = seededPermutation(seed, pool.length);
  return order.slice(0, Math.min(count, pool.length)).map((i) => pool[i]);
}
