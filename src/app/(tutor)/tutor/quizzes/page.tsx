import Link from "next/link";
import { db } from "@/lib/db";
import { QuizImportPanel } from "./QuizImportPanel";
import { NewQuizForm } from "@/components/quiz/NewQuizForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { badgeColorForKey } from "@/lib/ui/palette";

export default async function TutorQuizzesPage() {
  const [quizzes, lessons] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lesson: { select: { title: true } },
        questions: { select: { points: true } },
        submissions: { select: { status: true } },
      },
    }),
    db.lesson.findMany({
      orderBy: [{ module: { track: { title: "asc" } } }, { module: { order: "asc" } }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        module: { select: { title: true, track: { select: { title: true } } } },
      },
    }),
  ]);

  const lessonOptions = lessons.map((l) => ({
    id: l.id,
    label: `${l.module.track.title} / ${l.module.title} / ${l.title}`,
  }));
  const quizOptions = quizzes.map((q) => ({ id: q.id, title: q.title }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Quizzes" }]} />
        <h1 className="text-2xl font-semibold">Quizzes</h1>
      </div>

      <NewQuizForm lessonOptions={lessonOptions} />

      {quizzes.length === 0 ? (
        <p className="text-sm text-zinc-500">No quizzes yet — create one above, or import from CSV below.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const pending = quiz.submissions.filter((s) => s.status === "PENDING_REVIEW").length;
            const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
            const accent = badgeColorForKey(quiz.title).split(" ")[0];
            return (
              <Link
                key={quiz.id}
                href={`/tutor/quizzes/${quiz.id}`}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow"
              >
                <div className={`h-1.5 ${accent}`} />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="min-w-0 flex-1 font-medium text-zinc-900 group-hover:text-blue-700">
                      {quiz.title}
                    </h2>
                    {quiz.status === "DRAFT" && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {quiz.lesson ? quiz.lesson.title : "Standalone try-out"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"} · {totalPoints} pts
                    {quiz.timeLimitMinutes && ` · ⏱ ${quiz.timeLimitMinutes} min`}
                    {quiz.maxAttempts && ` · ${quiz.maxAttempts} attempts`}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {pending > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        {pending} pending
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {quiz.submissions.length} submission{quiz.submissions.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <QuizImportPanel lessonOptions={lessonOptions} quizOptions={quizOptions} />
    </div>
  );
}
