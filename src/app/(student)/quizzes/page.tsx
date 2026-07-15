import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";

export default async function StudentQuizzesPage() {
  const student = await requireStudent();

  const quizzes = await db.quiz.findMany({
    where: {
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
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = quizzes.map((quiz) => {
    const submission = quiz.submissions[0] ?? null;
    const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
    const score =
      submission === null
        ? null
        : submission.status === "REVIEWED"
          ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0)
          : submission.autoScore ?? 0;
    return { quiz, submission, totalPoints, score };
  });
  const tryOuts = rows.filter((r) => !r.quiz.lesson);
  const lessonQuizzes = rows.filter((r) => r.quiz.lesson);

  const card = ({ quiz, submission, totalPoints, score }: (typeof rows)[number]) => (
    <Link
      key={quiz.id}
      href={`/quizzes/${quiz.id}`}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900">{quiz.title}</p>
        <p className="mt-0.5 text-sm text-zinc-500">
          {quiz.lesson
            ? `${quiz.lesson.module.track.title} · ${quiz.lesson.title}`
            : "Try-out — open anytime"}
          {" · "}
          {quiz.questions.length} questions · {totalPoints} pts
        </p>
      </div>
      {submission ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-sm font-semibold text-zinc-800">
            {score} / {totalPoints}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[submission.status]}`}
          >
            {SUBMISSION_STATUS_LABEL[submission.status]}
          </span>
        </div>
      ) : (
        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          Not attempted
        </span>
      )}
      <span className="shrink-0 text-zinc-300">›</span>
    </Link>
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Quizzes" }]} />
        <h1 className="text-2xl font-semibold">Quizzes</h1>
      </div>

      {tryOuts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Try-outs</h2>
          {tryOuts.map(card)}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">From your lessons</h2>
        {lessonQuizzes.length === 0 && (
          <p className="text-sm text-zinc-500">No lesson quizzes available yet.</p>
        )}
        {lessonQuizzes.map(card)}
      </section>
    </div>
  );
}
