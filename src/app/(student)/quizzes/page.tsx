import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { QuizList, type StudentQuizRow } from "./QuizList";

export default async function StudentQuizzesPage() {
  const student = await requireStudent();

  const quizzes = await db.quiz.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        {
          lesson: {
            status: "PUBLISHED",
            module: { track: { enrollments: { some: { studentId: student.id } } } },
          },
        },
        { lessonId: null }, // standalone try-outs
      ],
    },
    include: {
      lesson: { select: { title: true, module: { select: { track: { select: { title: true } } } } } },
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
      trackTitle: quiz.lesson?.module.track.title ?? null,
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
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Quizzes" }]} />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold">Quizzes</h1>
          <p className="text-sm text-zinc-500">
            {done} of {rows.length} attempted
          </p>
        </div>
      </div>

      <QuizList quizzes={rows} />
    </div>
  );
}
