import Link from "next/link";
import { REVIEW_COUNT_DEFAULT, REVIEW_COUNT_MAX, reviewPool } from "@/lib/quiz/review";
import { DRILL_DEFAULTS, DRILL_SECONDS_MAX, DRILL_SECONDS_MIN, DRILL_SKILLS, DRILL_SKILL_KEYS } from "@/lib/drills/registry";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { DuplicateQuizForm } from "@/components/quiz/DuplicateQuizForm";
import { QUIZ_STYLES, isGradedStyle, isTimedStyle } from "@/lib/quiz/styles";
import { isPracticable } from "@/lib/quiz/practice";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteQuiz, updateQuizMeta, setQuizStatus, addQuestion } from "@/lib/actions/quizzes";
import { submissionStatusKey, SUBMISSION_STATUS_BADGE_CLASS } from "@/lib/quiz/format";
import { getT } from "@/lib/i18n/server";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { QuestionsSection } from "@/components/quiz/QuestionsSection";
import { ProjectAnswerKey, type AnswerKeyStep } from "@/components/projects/ProjectAnswerKey";
import { answerKey, loadSteps } from "@/lib/projects/progress";
import { stepHints } from "@/lib/projects/schema";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuizPlacementFields } from "@/components/quiz/QuizPlacementFields";
import { QuizStyleChip, QuizStyleField } from "@/components/quiz/QuizStyleField";
import { TRYOUT_DEFAULTS } from "@/lib/quiz/styles";
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
  { type: "STEPS", labelKey: "questionType.STEPS" },
  { type: "MULTI_PART", labelKey: "questionType.MULTI_PART" },
  { type: "FIND_MISTAKE", labelKey: "questionType.FIND_MISTAKE" },
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
        practiceProgress: { include: { student: { select: { name: true } } }, orderBy: { updatedAt: "desc" } },
        projectProgress: { include: { student: { select: { name: true } } }, orderBy: { updatedAt: "desc" } },
      },
    }),
    placementTree(),
  ]);
  if (!quiz) notFound();

  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
  // Practice can only use questions it can check instantly.
  const practicableIds = new Set(quiz.questions.filter(isPracticable).map((q) => q.id));
  // How much earlier material a review here could draw on. Counted whatever the
  // style is: the settings panel is revealed in CSS, so the number has to be on
  // the page already when the tutor picks Mixed review.
  const reviewPoolSize = (await reviewPool(quiz.id)).length;
  const unpracticable = quiz.questions.length - practicableIds.size;

  // A project's steps with the answer key, in place of the question list.
  let keySteps: AnswerKeyStep[] = [];
  if (quiz.style === "PROJECT") {
    const steps = loadSteps(quiz.questions);
    const key = answerKey(quiz.projectFiles, steps);
    keySteps = steps.map((s, i) => ({
      id: s.id,
      stage: s.step.stage,
      title: s.step.title,
      points: s.points,
      instruction: s.instruction,
      example: s.step.example,
      inputTests: s.step.tests.filter((c) => !c.script).length,
      functionChecks: s.step.tests.filter((c) => c.script).length,
      hints: stepHints(s.step),
      key: key[i],
    }));
  }

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
            <QuizStyleChip style={quiz.style} />
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
            {quiz.style === "DRILL"
              ? t("drill.meta", {
                  seconds: quiz.drillSeconds ?? DRILL_DEFAULTS.drillSeconds,
                  target: quiz.drillTarget ?? DRILL_DEFAULTS.drillTarget,
                })
              : quiz.style === "PROJECT"
                ? t("project.meta", { n: quiz.questions.length, p: totalPoints })
                : isGradedStyle(quiz.style)
                ? t("quizDetail.metaCounts", { q: quiz.questions.length, p: totalPoints })
                : t(quiz.questions.length === 1 ? "practice.metaOne" : "practice.meta", { n: quiz.questions.length })}
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
          <div className="group space-y-3">
            {quiz.style === "PROJECT" ? (
              // A project's style is fixed: its steps only work in the project player.
              <div>
                <p className="mb-1 block text-xs font-medium text-zinc-500">{t("quizStyle.label")}</p>
                <p className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{t("quizDetail.projectStyleFixed")}</p>
              </div>
            ) : (
              <QuizStyleField defaultStyle={quiz.style} />
            )}
            {/* Review settings, revealed while Mixed review is picked. */}
            <div className="hidden space-y-3 rounded-lg border border-teal-200 bg-teal-50/40 p-3 group-has-[input[value=REVIEW]:checked]:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">{t("review.settings")}</p>
              <p className="text-xs text-teal-900">{t("review.poolNote")}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{t("review.countLabel")}</label>
                  <input
                    name="reviewCount"
                    type="number"
                    min={1}
                    max={REVIEW_COUNT_MAX}
                    defaultValue={quiz.reviewCount ?? REVIEW_COUNT_DEFAULT}
                    className={inputCls}
                  />
                </div>
                <p className="self-end pb-2 text-xs text-zinc-500">{t("review.poolSize", { n: reviewPoolSize })}</p>
              </div>
            </div>
            {/* Drill settings, revealed the same way while Drill is picked. */}
            <div className="hidden space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3 group-has-[input[value=DRILL]:checked]:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">{t("drill.settings")}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <label className={labelCls}>{t("drill.skillLabel")}</label>
                  <select name="drillSkill" defaultValue={quiz.drillSkill ?? DRILL_DEFAULTS.drillSkill} className={inputCls}>
                    {DRILL_SKILL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {t(DRILL_SKILLS[key].labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("drill.secondsLabel")}</label>
                  <input
                    name="drillSeconds"
                    type="number"
                    min={DRILL_SECONDS_MIN}
                    max={DRILL_SECONDS_MAX}
                    defaultValue={quiz.drillSeconds ?? DRILL_DEFAULTS.drillSeconds}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t("drill.targetLabel")}</label>
                  <input
                    name="drillTarget"
                    type="number"
                    min={1}
                    defaultValue={quiz.drillTarget ?? DRILL_DEFAULTS.drillTarget}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
            {/* Only while a timed style is picked. Done in CSS so the page stays a
                server component; switching a classic quiz over shows the house defaults. */}
            <div className="hidden space-y-3 rounded-lg border border-violet-200 bg-violet-50/40 p-3 group-has-[input[value=TRYOUT]:checked]:block group-has-[input[value=EXAM]:checked]:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">{t("quizStyle.timedSettings")}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>{t("quizDetail.timeLimit")}</label>
                  <input
                    name="timeLimitMinutes"
                    type="number"
                    min={1}
                    defaultValue={quiz.timeLimitMinutes ?? TRYOUT_DEFAULTS.timeLimitMinutes}
                    className={inputCls}
                  />
                </div>
                {/* An exam is always one attempt, so it doesn't offer the choice. */}
                <div className="group-has-[input[value=EXAM]:checked]:hidden">
                  <label className={labelCls}>{t("quizDetail.maxAttempts")}</label>
                  <input
                    name="maxAttempts"
                    type="number"
                    min={1}
                    defaultValue={quiz.style === "TRYOUT" ? (quiz.maxAttempts ?? "") : TRYOUT_DEFAULTS.maxAttempts}
                    // Exams keep one attempt whatever this says; see updateQuizMeta.
                    placeholder={t("quizDetail.unlimitedPlaceholder")}
                    className={inputCls}
                  />
                </div>
                <label className="col-span-2 flex items-center gap-2 self-end pb-2 text-sm text-zinc-600 sm:col-span-1">
                  <input
                    type="checkbox"
                    name="randomizeQuestionOrder"
                    defaultChecked={isTimedStyle(quiz.style) ? quiz.randomizeQuestionOrder : TRYOUT_DEFAULTS.randomizeQuestionOrder}
                  />
                  {t("quizDetail.randomizeTryout")}
                </label>
              </div>
              <p className="hidden text-xs text-violet-700 group-has-[input[value=EXAM]:checked]:block">
                {t("quizDetail.examOneAttempt")}
              </p>
            </div>
          </div>
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
          {quiz.style === "PROJECT" && (
            <Link
              href={`/tutor/quizzes/${quiz.id}/preview`}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {t("quizDetail.previewProject")}
            </Link>
          )}
          {quiz.style !== "PROJECT" && (
          <SlideOverButton
            label={t("quizDuplicate.button")}
            title={t("quizDuplicate.title")}
            description={
              quiz.questions.length === 1
                ? t("quizDuplicate.descriptionOne")
                : t("quizDuplicate.description", { n: quiz.questions.length })
            }
            variant="secondary"
            icon="none"
          >
            <DuplicateQuizForm
              sourceQuizId={quiz.id}
              defaultTitle={t("quizDuplicate.titleDefault", { title: quiz.title })}
              // Suggest another style — reuse in a different style is the point.
              defaultStyle={QUIZ_STYLES.find((s) => s !== quiz.style) ?? quiz.style}
              tree={tree}
              chapterId={quiz.chapterId}
              lessonId={quiz.lessonId}
            />
          </SlideOverButton>
          )}
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

      {quiz.style === "REVIEW" ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("quizDetail.questions")}</h2>
          <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900">
            {t("review.poolNote")} {t("review.poolSize", { n: reviewPoolSize })}
          </p>
        </section>
      ) : quiz.style === "DRILL" ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("quizDetail.questions")}</h2>
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{t("drill.questionsUnused")}</p>
        </section>
      ) : (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{quiz.style === "PROJECT" ? t("projectKey.heading") : t("quizDetail.questions")}</h2>
        {quiz.style === "PROJECT" ? (
          <ProjectAnswerKey steps={keySteps} />
        ) : (
          <QuestionsSection questions={quiz.questions} practice={!isGradedStyle(quiz.style)} />
        )}

        {/* A project's steps are written with the project, not added one type at a time. */}
        {quiz.style === "PROJECT" ? (
          <p className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{t("quizDetail.projectStepsByFile")}</p>
        ) : (
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
        )}
      </section>
      )}

      {!isGradedStyle(quiz.style) ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("quizDetail.practiceProgress")}</h2>
          <p className="text-xs text-zinc-500">{t("quizDetail.practiceNotGraded")}</p>
          {quiz.style === "MASTERY" && unpracticable > 0 && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t("quizDetail.unpracticable", { n: unpracticable })}
            </p>
          )}
          {quiz.practiceProgress.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("quizDetail.noPractice")}</p>
          ) : (
            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
              {quiz.practiceProgress.map((p) => {
                const mastered = p.masteredIds.filter((id) => practicableIds.has(id)).length;
                return (
                  <div key={p.studentId} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(p.student.name)}`}
                    >
                      {initialsFor(p.student.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">{p.student.name}</span>
                    {quiz.style === "DRILL" || quiz.style === "REVIEW" ? (
                      <>
                        <span className="shrink-0 text-sm tabular-nums text-zinc-500">
                          {quiz.style === "REVIEW"
                            ? t("review.bestScore", {
                                n: p.bestScore ?? 0,
                                // A thin pool means a shorter set than the setting asks for.
                                total: Math.min(quiz.reviewCount ?? REVIEW_COUNT_DEFAULT, reviewPoolSize),
                              })
                            : t("drill.progress", {
                                best: p.bestScore ?? 0,
                                target: quiz.drillTarget ?? DRILL_DEFAULTS.drillTarget,
                              })}{" "}
                          · {t(p.runs === 1 ? "drill.roundsOne" : "drill.rounds", { n: p.runs })}
                        </span>
                        {p.completedAt && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            ✓ {t("outline.practiceDone")}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="shrink-0 text-sm tabular-nums text-zinc-500">
                          {t("quizDetail.practiceMastered", { n: mastered, total: practicableIds.size })}
                        </span>
                        {p.runs > 0 && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            ✓ {p.runs === 1 ? t("quizDetail.practiceRunsOne") : t("quizDetail.practiceRuns", { n: p.runs })}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
      <>
      {quiz.style === "PROJECT" && (
        // Where each student is, before they finish. A finished project also
        // turns up under the results below, for review.
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("projectProgress.title")}</h2>
          {quiz.projectProgress.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("projectProgress.none")}</p>
          ) : (
            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
              {quiz.projectProgress.map((p) => {
                const stepIds = new Set(quiz.questions.filter((q) => q.type === "PROJECT_STEP").map((q) => q.id));
                const passed = p.passedIds.filter((id) => stepIds.has(id)).length;
                const failed = Object.values((p.failedChecks ?? {}) as Record<string, number>).reduce(
                  (n, v) => n + (typeof v === "number" ? v : 0),
                  0
                );
                return (
                  <div key={p.studentId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(p.student.name)}`}
                    >
                      {initialsFor(p.student.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">{p.student.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-zinc-500">
                      {t("projectProgress.steps", { n: passed, total: stepIds.size })} ·{" "}
                      {t("projectProgress.failed", { n: failed })}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.completedAt ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {p.completedAt ? t("projectProgress.finished") : t("projectProgress.inProgress")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
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
      </>
      )}
    </div>
  );
}
