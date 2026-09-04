import { db } from "@/lib/db";
import { QuizImportPanel } from "./QuizImportPanel";
import { QuizTable, type TutorQuizRow } from "./QuizTable";
import { NewQuizForm } from "@/components/quiz/NewQuizForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function TutorQuizzesPage() {
  const [quizzes, lessons] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          select: { title: true, chapter: { select: { course: { select: { title: true } } } } },
        },
        questions: { select: { points: true } },
        submissions: { select: { status: true } },
      },
    }),
    db.lesson.findMany({
      orderBy: [{ chapter: { course: { title: "asc" } } }, { chapter: { order: "asc" } }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        chapter: { select: { title: true, course: { select: { title: true } } } },
      },
    }),
  ]);

  const lessonOptions = lessons.map((l) => ({
    id: l.id,
    label: `${l.chapter.course.title} / ${l.chapter.title} / ${l.title}`,
  }));
  const quizOptions = quizzes.map((q) => ({ id: q.id, title: q.title }));

  const rows: TutorQuizRow[] = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    isDraft: quiz.status === "DRAFT",
    lessonTitle: quiz.lesson?.title ?? null,
    trackTitle: quiz.lesson?.chapter.course.title ?? null,
    questionCount: quiz.questions.length,
    totalPoints: quiz.questions.reduce((n, q) => n + q.points, 0),
    timeLimitMinutes: quiz.timeLimitMinutes,
    maxAttempts: quiz.maxAttempts,
    submissionCount: quiz.submissions.length,
    pendingCount: quiz.submissions.filter((s) => s.status === "PENDING_REVIEW").length,
    createdAt: quiz.createdAt.toISOString(),
  }));
  const needsReview = rows.reduce((n, r) => n + r.pendingCount, 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Quizzes" }]} />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold">Quizzes</h1>
          <p className="text-sm text-zinc-500">
            {rows.length} total · {rows.filter((r) => !r.isDraft).length} published
            {needsReview > 0 && (
              <span className="text-amber-700"> · {needsReview} submissions awaiting review</span>
            )}
          </p>
        </div>
      </div>

      <NewQuizForm lessonOptions={lessonOptions} />

      <QuizTable quizzes={rows} />

      <QuizImportPanel lessonOptions={lessonOptions} quizOptions={quizOptions} />
    </div>
  );
}
