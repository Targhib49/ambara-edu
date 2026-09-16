import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteQuiz, updateQuizMeta, setQuizStatus, addQuestion } from "@/lib/actions/quizzes";
import { submissionStatusKey, SUBMISSION_STATUS_BADGE_CLASS } from "@/lib/quiz/format";
import { getT } from "@/lib/i18n/server";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { QuestionsSection } from "@/components/quiz/QuestionsSection";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuizPlacementFields } from "@/components/quiz/QuizPlacementFields";
import { placementTree } from "@/lib/courses/placement";
import type { MessageKey } from "@/lib/i18n/messages";
import type { QuestionType } from "@/generated/prisma/enums";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-zinc-500";

const QUESTION_TYPE_BUTTONS: { type: QuestionType; labelKey: MessageKey }[] = [
  { type: "MULTIPLE_CHOICE", labelKey: "questionType.MULTIPLE_CHOICE" },
  { type: "MULTI_SELECT", labelKey: "questionType.MULTI_SELECT" },
  { type: "NUMERIC", labelKey: "questionType.NUMERIC" },
  { type: "SHORT_TEXT", labelKey: "questionType.SHORT_TEXT" },
  { type: "CODE", labelKey: "questionType.CODE" },
];

export default async function TutorQuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const t = await getT();
  const [quiz, tree] = await Promise.all([
    db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: { select: { title: true } },
        chapter: { select: { title: true, course: { select: { id: true, title: true } } } },
        questions: { orderBy: { order: "asc" } },
        submissions: { include: { student: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      },
    }),
    placementTree(),
  ]);
  if (!quiz) notFound();

  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <PageHeader
        crumbs={[
          { label: t("nav.home"), href: "/tutor" },
          { label: t("nav.quizzes"), href: "/tutor/quizzes" },
          ...(quiz.chapter ? [{ label: quiz.chapter.course.title, href: `/tutor/courses/${quiz.chapter.course.id}` }] : []),
          { label: quiz.title },
        ]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {quiz.title}
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                quiz.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {quiz.status === "PUBLISHED" ? t("courseStatus.PUBLISHED") : t("status.draft")}
            </span>
          </span>
        }
        meta={
          <>
            {quiz.chapter
              ? `${quiz.chapter.title} › ${
                  quiz.lesson
                    ? t("quizDetail.afterLessonMeta", { title: quiz.lesson.title })
                    : t("quizDetail.endOfChapterMeta")
                }`
              : t("quizDetail.notPlaced")}
            {" · "}
            {t("quizDetail.metaCounts", { q: quiz.questions.length, p: totalPoints })}
          </>
        }
      />

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">{t("quizDetail.settings")}</h2>
        <form action={updateQuizMeta.bind(null, quiz.id)} className="space-y-3">
          <div>
            <label className={labelCls}>{t("courseEditor.title")}</label>
            <input name="title" defaultValue={quiz.title} required className={inputCls} />
          </div>
          <QuizPlacementFields tree={tree} defaultChapterId={quiz.chapterId} defaultLessonId={quiz.lessonId} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>{t("quizDetail.timeLimit")}</label>
              <input
                name="timeLimitMinutes"
                type="number"
                min={1}
                defaultValue={quiz.timeLimitMinutes ?? ""}
                placeholder={t("quizDetail.untimedPlaceholder")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("quizDetail.maxAttempts")}</label>
              <input
                name="maxAttempts"
                type="number"
                min={1}
                defaultValue={quiz.maxAttempts ?? ""}
                placeholder={t("quizDetail.unlimitedPlaceholder")}
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-600">
              <input type="checkbox" name="randomizeQuestionOrder" defaultChecked={quiz.randomizeQuestionOrder} />
              {t("quizDetail.randomize")}
            </label>
          </div>
          <p className="text-xs text-zinc-400">{t("quizDetail.settingsHint")}</p>
          <SubmitButton
            pendingLabel={t("action.saving")}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {t("quizDetail.saveSettings")}
          </SubmitButton>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          <form action={setQuizStatus.bind(null, quiz.id, quiz.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}>
            <SubmitButton
              pendingLabel={t("lessonEditor.updating")}
              className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                quiz.status === "PUBLISHED"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
            >
              {quiz.status === "PUBLISHED" ? t("lessonEditor.unpublish") : t("lessonEditor.publish")}
            </SubmitButton>
          </form>
          <form action={deleteQuiz.bind(null, quiz.id)}>
            <ConfirmButton
              message={t("quizDetail.deleteConfirm", { title: quiz.title })}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              {t("quizDetail.deleteQuiz")}
            </ConfirmButton>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("quizDetail.questions")}</h2>
        <QuestionsSection questions={quiz.questions} />

        <div className="rounded-xl border border-dashed border-zinc-300 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-600">{t("quizDetail.addQuestion")}</p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPE_BUTTONS.map(({ type, labelKey }) => (
              <form key={type} action={addQuestion.bind(null, quiz.id, type)}>
                <SubmitButton
                  pendingLabel={t("action.adding")}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
                >
                  + {t(labelKey)}
                </SubmitButton>
              </form>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("quizDetail.submissions")}</h2>
        {quiz.submissions.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("quizDetail.noSubmissions")}</p>
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
                  {t(submissionStatusKey(s.status))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
