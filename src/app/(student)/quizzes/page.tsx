import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { badgeColorForKey } from "@/lib/ui/palette";

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

  const rows = quizzes.map((quiz) => {
    const submission = quiz.submissions[0] ?? null;
    const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
    const score =
      submission === null
        ? null
        : submission.status === "REVIEWED"
          ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0)
          : submission.autoScore ?? 0;
    const attemptsUsed = quiz.submissionAttempts.length + (submission ? 1 : 0);
    const attemptsRemaining = quiz.maxAttempts !== null ? Math.max(0, quiz.maxAttempts - attemptsUsed) : null;
    return { quiz, submission, totalPoints, score, attemptsRemaining };
  });
  const tryOuts = rows.filter((r) => !r.quiz.lesson);
  const lessonQuizzes = rows.filter((r) => r.quiz.lesson);

  const card = ({ quiz, submission, totalPoints, score, attemptsRemaining }: (typeof rows)[number]) => {
    const accentKey = quiz.lesson ? quiz.lesson.module.track.title : quiz.title;
    const accent = badgeColorForKey(accentKey).split(" ")[0];
    const pct = submission && totalPoints > 0 ? ((score ?? 0) / totalPoints) * 100 : null;

    return (
      <Link
        key={quiz.id}
        href={`/quizzes/${quiz.id}`}
        className="group flex items-center gap-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow"
      >
        <div className={`h-full w-1.5 self-stretch ${accent}`} />
        <div className="min-w-0 flex-1 py-4 pr-2">
          <div className="flex items-center gap-2">
            <p className="font-medium text-zinc-900 group-hover:text-blue-700">{quiz.title}</p>
            {!quiz.lesson && (
              <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                ⚡ open anytime
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">
            {quiz.lesson ? quiz.lesson.title : "Try-out"}
            {" · "}
            {quiz.questions.length} questions · {totalPoints} pts
            {quiz.timeLimitMinutes && ` · ⏱ ${quiz.timeLimitMinutes} min`}
            {attemptsRemaining !== null && ` · ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} left`}
          </p>
          {submission && (
            <span
              className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[submission.status]}`}
            >
              {SUBMISSION_STATUS_LABEL[submission.status]}
            </span>
          )}
        </div>
        <div className="shrink-0 pr-4">
          {pct !== null ? (
            <ScoreRing pct={pct} />
          ) : (
            <span className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white group-hover:bg-blue-500">
              Start →
            </span>
          )}
        </div>
      </Link>
    );
  };

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
