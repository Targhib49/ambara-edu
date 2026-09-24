import { GRADED_STYLES } from "@/lib/quiz/styles";
import { db } from "@/lib/db";

export type CourseScore = {
  /** Points earned across every graded quiz in the course. */
  earned: number;
  /** Points those quizzes are worth in total. */
  total: number;
  /** Percentage, rounded to one decimal; zero when the course has nothing graded. */
  pct: number;
  /** Graded quizzes in the course, and how many the student has submitted. */
  quizzes: number;
  submitted: number;
};

/**
 * How a student stands in a course, as one percentage: everything they've
 * earned over everything the course's graded quizzes are worth.
 *
 * A quiz they never sat counts as zero rather than being left out. Averaging
 * only what was attempted would let one good score on one quiz pass a gate
 * that a whole course is meant to guard — Targhib's call when we set this up.
 *
 * A course with nothing graded scores zero, so a gate behind it never opens
 * by accident; a syllabus that wants such a course to pass freely sets its
 * pass mark to nought.
 */
export async function courseScore(studentId: string, courseId: string): Promise<CourseScore> {
  const quizzes = await db.quiz.findMany({
    where: {
      status: "PUBLISHED",
      style: { in: GRADED_STYLES },
      chapter: { courseId },
      OR: [{ lessonId: null }, { lesson: { status: "PUBLISHED" } }],
    },
    select: {
      questions: { select: { points: true } },
      submissions: { where: { studentId }, select: { status: true, autoScore: true, manualScore: true } },
    },
  });

  let earned = 0;
  let total = 0;
  let submitted = 0;
  for (const quiz of quizzes) {
    const worth = quiz.questions.reduce((n, q) => n + q.points, 0);
    total += worth;
    const submission = quiz.submissions[0];
    if (!submission) continue;
    submitted++;
    // A reviewed submission's manual adjustment counts; an unreviewed one is
    // worth what it scored automatically, the same rule every other screen uses.
    const score =
      submission.status === "REVIEWED" ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0) : submission.autoScore ?? 0;
    earned += Math.max(0, score);
  }

  return {
    earned,
    total,
    pct: total > 0 ? Math.round((earned / total) * 1000) / 10 : 0,
    quizzes: quizzes.length,
    submitted,
  };
}

/** The same figure for several courses at once, for a syllabus page. */
export async function courseScores(studentId: string, courseIds: string[]): Promise<Map<string, CourseScore>> {
  const entries = await Promise.all(courseIds.map(async (id) => [id, await courseScore(studentId, id)] as const));
  return new Map(entries);
}
