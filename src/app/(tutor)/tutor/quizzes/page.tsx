import Link from "next/link";
import { db } from "@/lib/db";
import { QuizImportPanel } from "./QuizImportPanel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function TutorQuizzesPage() {
  const [quizzes, lessons] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lesson: { select: { title: true } },
        _count: { select: { questions: true, submissions: true } },
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
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Quizzes" }]} />
        <h1 className="text-2xl font-semibold">Quizzes</h1>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-sm text-zinc-500">No quizzes yet — import one below.</p>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {quizzes.map((quiz) => {
            const pending = quiz.submissions.filter((s) => s.status === "PENDING_REVIEW").length;
            return (
              <Link
                key={quiz.id}
                href={`/tutor/quizzes/${quiz.id}`}
                className="flex items-center gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-zinc-900">{quiz.title}</h2>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {quiz.lesson ? quiz.lesson.title : "Standalone"} · {quiz._count.questions} questions
                  </p>
                </div>
                {pending > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {pending} pending
                  </span>
                )}
                <span className="shrink-0 text-xs text-zinc-400">{quiz._count.submissions} submissions</span>
                <span className="shrink-0 text-zinc-300">›</span>
              </Link>
            );
          })}
        </div>
      )}

      <QuizImportPanel lessonOptions={lessonOptions} quizOptions={quizOptions} />
    </div>
  );
}
