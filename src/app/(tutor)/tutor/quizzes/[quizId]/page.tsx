import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteQuiz, updateQuizMeta, setQuizStatus, addQuestion } from "@/lib/actions/quizzes";
import { SUBMISSION_STATUS_LABEL, SUBMISSION_STATUS_BADGE_CLASS } from "@/lib/quiz/format";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { QuestionsSection } from "@/components/quiz/QuestionsSection";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { QuestionType } from "@/generated/prisma/enums";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-zinc-500";

const QUESTION_TYPE_BUTTONS: { type: QuestionType; label: string }[] = [
  { type: "MULTIPLE_CHOICE", label: "Multiple choice" },
  { type: "MULTI_SELECT", label: "Multi-select" },
  { type: "NUMERIC", label: "Numeric" },
  { type: "SHORT_TEXT", label: "Short text" },
  { type: "CODE", label: "Code" },
];

export default async function TutorQuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const [quiz, lessons] = await Promise.all([
    db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: { select: { title: true, moduleId: true } },
        questions: { orderBy: { order: "asc" } },
        submissions: { include: { student: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
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
  if (!quiz) notFound();

  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
  const lessonOptions = lessons.map((l) => ({
    id: l.id,
    label: `${l.module.track.title} / ${l.module.title} / ${l.title}`,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-3">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/tutor" },
            { label: "Quizzes", href: "/tutor/quizzes" },
            { label: quiz.title },
          ]}
        />
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{quiz.title}</h1>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              quiz.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {quiz.status === "PUBLISHED" ? "Published" : "Draft"}
          </span>
        </div>
        <p className="text-sm text-zinc-500">
          {quiz.questions.length} questions · {totalPoints} points total
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Settings</h2>
        <form action={updateQuizMeta.bind(null, quiz.id)} className="space-y-3">
          <div>
            <label className={labelCls}>Title</label>
            <input name="title" defaultValue={quiz.title} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Lesson</label>
            <select name="lessonId" defaultValue={quiz.lessonId ?? ""} className={inputCls}>
              <option value="">Standalone (try-out — open at /quizzes)</option>
              {lessonOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Time limit (minutes)</label>
              <input
                name="timeLimitMinutes"
                type="number"
                min={1}
                defaultValue={quiz.timeLimitMinutes ?? ""}
                placeholder="untimed"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Max attempts</label>
              <input
                name="maxAttempts"
                type="number"
                min={1}
                defaultValue={quiz.maxAttempts ?? ""}
                placeholder="unlimited"
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-600">
              <input type="checkbox" name="randomizeQuestionOrder" defaultChecked={quiz.randomizeQuestionOrder} />
              Randomize order
            </label>
          </div>
          <p className="text-xs text-zinc-400">
            Leave time limit / attempts blank for the classic untimed, unlimited-retake behavior.
          </p>
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Save settings
          </SubmitButton>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          <form action={setQuizStatus.bind(null, quiz.id, quiz.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}>
            <SubmitButton
              pendingLabel="Updating…"
              className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                quiz.status === "PUBLISHED"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
            >
              {quiz.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </SubmitButton>
          </form>
          <form action={deleteQuiz.bind(null, quiz.id)}>
            <ConfirmButton
              message={`Delete "${quiz.title}" and all its submissions? This can't be undone.`}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete quiz
            </ConfirmButton>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Questions</h2>
        <QuestionsSection questions={quiz.questions} />

        <div className="rounded-xl border border-dashed border-zinc-300 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-600">Add a question</p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPE_BUTTONS.map(({ type, label }) => (
              <form key={type} action={addQuestion.bind(null, quiz.id, type)}>
                <SubmitButton
                  pendingLabel="Adding…"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
                >
                  + {label}
                </SubmitButton>
              </form>
            ))}
          </div>
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
