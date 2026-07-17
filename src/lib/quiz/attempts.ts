import { db } from "@/lib/db";

/**
 * How many attempts a student has used up on a quiz: every past
 * SubmissionAttempt snapshot (created on each retake, see submitQuizAnswers)
 * plus one more if a live Submission currently exists. Works for both timed
 * and untimed quizzes since SubmissionAttempt history is generic.
 */
export async function countAttemptsUsed(studentId: string, quizId: string): Promise<number> {
  const [historyCount, live] = await Promise.all([
    db.submissionAttempt.count({ where: { studentId, quizId } }),
    db.submission.findUnique({
      where: { studentId_quizId: { studentId, quizId } },
      select: { id: true },
    }),
  ]);
  return historyCount + (live ? 1 : 0);
}

/** Fisher–Yates shuffle — used to freeze a random question order per attempt. */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
