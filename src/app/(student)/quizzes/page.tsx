import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuizList, type StudentQuizRow } from "./QuizList";

export default async function StudentQuizzesPage() {
  const student = await requireStudent();

  const quizzes = await db.quiz.findMany({
    where: {
      status: "PUBLISHED",
      // Every quiz belongs to a chapter; the student must be enrolled in that
      // chapter's (published) course, and a lesson quiz also needs its lesson live.
      chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } } },
      OR: [{ lessonId: null }, { lesson: { status: "PUBLISHED" } }],
    },
    include: {
      lesson: { select: { title: true } },
      chapter: { select: { title: true, course: { select: { title: true } } } },
      questions: { select: { points: true } },
      submissions: { where: { studentId: student.id } },
      submissionAttempts: { where: { studentId: student.id }, select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: StudentQuizRow[] = quizzes.map((quiz) => {
    const submission = quiz.submissions[0] ?? null;
    const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
    const score =
      submission === null
        ? null
        : submission.status === "REVIEWED"
          ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0)
          : submission.autoScore ?? 0;
    const attemptsUsed = quiz.submissionAttempts.length + (submission ? 1 : 0);

    return {
      id: quiz.id,
      title: quiz.title,
      lessonTitle: quiz.lesson?.title ?? null,
      trackTitle: quiz.chapter?.course.title ?? null,
      chapterTitle: quiz.chapter?.title ?? null,
      questionCount: quiz.questions.length,
      totalPoints,
      timeLimitMinutes: quiz.timeLimitMinutes,
      attemptsRemaining:
        quiz.maxAttempts !== null ? Math.max(0, quiz.maxAttempts - attemptsUsed) : null,
      status: submission?.status ?? null,
      scorePct: submission && totalPoints > 0 ? ((score ?? 0) / totalPoints) * 100 : null,
    };
  });

  const done = rows.filter((r) => r.status !== null).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Quizzes" }]}
        title="Quizzes"
        meta={`${done} of ${rows.length} attempted`}
      />

      <QuizList quizzes={rows} />
    </div>
  );
}
