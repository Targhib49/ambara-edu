import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteQuiz } from "@/lib/actions/quizzes";
import { formatCorrectAnswer, SUBMISSION_STATUS_LABEL, SUBMISSION_STATUS_BADGE_CLASS } from "@/lib/quiz/format";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function TutorQuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: { select: { title: true, moduleId: true } },
      questions: { orderBy: { order: "asc" } },
      submissions: { include: { student: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!quiz) notFound();

  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/tutor" },
            { label: "Quizzes", href: "/tutor/quizzes" },
            { label: quiz.title },
          ]}
        />
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{quiz.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {quiz.lesson ? quiz.lesson.title : "Standalone"} · {quiz.questions.length} questions ·{" "}
              {totalPoints} points total
            </p>
          </div>
          <form action={deleteQuiz.bind(null, quiz.id)}>
            <ConfirmButton
              message={`Delete "${quiz.title}" and all its submissions? This can't be undone.`}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              Delete quiz
            </ConfirmButton>
          </form>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Questions</h2>
        <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Q{i + 1} · {q.type.replace("_", " ").toLowerCase()} · {q.points} pt{q.points === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-zinc-900">{q.prompt}</p>
              <p className="mt-1 text-sm text-zinc-500">
                Correct: {formatCorrectAnswer(q.type, q.correctAnswer, q.options)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Submissions</h2>
        {quiz.submissions.length === 0 ? (
          <p className="text-sm text-zinc-500">No submissions yet.</p>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            {quiz.submissions.map((s) => (
              <Link
                key={s.id}
                href={`/tutor/quizzes/${quiz.id}/submissions/${s.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(s.student.name)}`}
                >
                  {initialsFor(s.student.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">
                  {s.student.name}
                </span>
                <span className="shrink-0 text-sm text-zinc-500">
                  {s.status === "PENDING_REVIEW"
                    ? "—"
                    : `${(s.autoScore ?? 0) + (s.manualScore ?? 0)}/${totalPoints}`}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[s.status]}`}
                >
                  {SUBMISSION_STATUS_LABEL[s.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
