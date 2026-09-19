import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { gradeQuestion } from "@/lib/quiz/grading";
import { formatCorrectAnswer, formatResponse } from "@/lib/quiz/format";
import { submissionAnswersSchema } from "@/lib/quiz/schema";
import { CodeSubmissionView } from "@/components/quiz/CodeSubmissionView";
import { ReviewForm } from "./ReviewForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProjectFilesViewer } from "@/components/projects/ProjectFilesViewer";
import { ProjectReviewForm } from "./ProjectReviewForm";
import { answerKey, loadSteps } from "@/lib/projects/progress";
import { projectStepResponseSchema } from "@/lib/projects/schema";

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ quizId: string; submissionId: string }>;
}) {
  const t = await getT();
  const { quizId, submissionId } = await params;
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: { select: { name: true } },
      quiz: { include: { questions: { orderBy: { order: "asc" } } } },
    },
  });
  if (!submission || submission.quizId !== quizId) notFound();

  // Same tolerance as the student's results view: a submission whose stored
  // answers don't parse shows as unanswered rather than failing the page.
  const parsedAnswers = submissionAnswersSchema.safeParse(submission.answers);
  const answers = parsedAnswers.success ? parsedAnswers.data : [];
  const totalPoints = submission.quiz.questions.reduce((n, q) => n + q.points, 0);

  const crumbs = [
    { label: t("nav.home"), href: "/tutor" },
    { label: t("nav.quizzes"), href: "/tutor/quizzes" },
    { label: submission.quiz.title, href: `/tutor/quizzes/${quizId}` },
    { label: t("submissionPage.title", { name: submission.student.name }) },
  ];

  if (submission.quiz.style === "PROJECT") {
    // A project is reviewed by its code and by how each step went, not by
    // question answers; its files live on the student's progress.
    const progress = await db.projectProgress.findUnique({
      where: { studentId_quizId: { studentId: submission.studentId, quizId } },
    });
    const files = (progress?.files ?? {}) as Record<string, string>;
    const steps = loadSteps(submission.quiz.questions).map((s) => {
      const answer = answers.find((a) => a.questionId === s.id);
      const response = projectStepResponseSchema.safeParse(answer?.response);
      const grade = gradeQuestion({ type: "PROJECT_STEP", points: s.points, correctAnswer: s.step }, answer?.response ?? null);
      return { ...s, failedChecks: response.success ? response.data.failedChecks : 0, earned: grade.earnedPoints };
    });
    // The finished program from the answer key, to read the student's against.
    const finalKey = answerKey(submission.quiz.projectFiles, loadSteps(submission.quiz.questions)).at(-1) ?? null;
    const autoScore = submission.autoScore ?? 0;
    const currentScore =
      submission.status === "REVIEWED" ? Math.round((autoScore + (submission.manualScore ?? 0)) * 100) / 100 : autoScore;

    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
        <div>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-2 text-2xl font-semibold">{t("submissionPage.title", { name: submission.student.name })}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {t("projectReview.meta", { steps: steps.length, total: totalPoints })}
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">{t("projectReview.step")}</th>
                <th className="px-4 py-2 text-right font-medium">{t("projectReview.failedChecks")}</th>
                <th className="px-4 py-2 text-right font-medium">{t("projectReview.earned")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {steps.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2.5">
                    <span className="block text-xs text-zinc-400">{s.step.stage}</span>
                    <span className="text-zinc-900">{s.step.title}</span>
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${s.failedChecks > 0 ? "text-amber-700" : "text-zinc-500"}`}>
                    {s.failedChecks}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900">
                    {s.earned} / {s.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium">{t("projectReview.files")}</h2>
          {Object.keys(files).length > 0 ? (
            <ProjectFilesViewer files={files} />
          ) : (
            <p className="text-sm text-zinc-500">{t("projectReview.noFiles")}</p>
          )}
        </section>

        {finalKey && (
          <details className="group space-y-2">
            <summary className="cursor-pointer font-medium text-blue-700 hover:underline">{t("projectKey.final")}</summary>
            <div className="pt-2">
              <ProjectFilesViewer files={finalKey.files} />
            </div>
          </details>
        )}

        <ProjectReviewForm
          submissionId={submission.id}
          autoScore={autoScore}
          currentScore={currentScore}
          totalPoints={totalPoints}
          feedback={submission.feedback}
          reviewed={submission.status === "REVIEWED"}
        />
      </div>
    );
  }

  const rows = submission.quiz.questions.map((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    const grade = gradeQuestion(q, answer?.response ?? null);
    return {
      question: q,
      response: answer?.response,
      grade,
    };
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-2 text-2xl font-semibold">{t("submissionPage.title", { name: submission.student.name })}</h1>
      </div>

      <div className="space-y-4">
        {rows.map(({ question, response, grade }, i) => (
          <div key={question.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {t(question.points === 1 ? "quizPage.questionLabel" : "quizPage.questionLabelPlural", { i: i + 1, p: question.points })}
            </p>
            <p className="mt-1 text-sm text-zinc-900">{question.prompt}</p>

            {question.type === "CODE" ? (
              <div className="mt-3">
                <CodeSubmissionView correctAnswer={question.correctAnswer} response={response} />
                {grade.earnedPoints > 0 && (
                  <p className="mt-1.5 text-xs text-zinc-500">
                    {t("submissionPage.codeAutoScore", { earned: grade.earnedPoints, points: question.points })}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-zinc-500">{t("review.answer")}</span>
                  {formatResponse(question.type, response, question.options, { noAnswer: t("quiz.noAnswer") })}
                </p>
                <p>
                  <span className="text-zinc-500">{t("review.correctAnswer")}</span>
                  {formatCorrectAnswer(question.type, question.correctAnswer, question.options)}
                </p>
              </div>
            )}

            <div className="mt-3">
              {grade.status === "AUTO_GRADED" ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    grade.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {t("review.autoGradedVerdict", { verdict: grade.correct ? t("quiz.correct") : t("quiz.incorrect") })}
                </span>
              ) : submission.status === "REVIEWED" ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {t("submission.REVIEWED")}
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {t("reviewForm.needsReview")}
                </span>
              )}
            </div>

            {question.explanation && (
              <p className="mt-2 text-xs text-zinc-500">{t("submissionPage.explanation", { text: question.explanation })}</p>
            )}
          </div>
        ))}
      </div>

      <ReviewForm
        submissionId={submission.id}
        autoScore={submission.autoScore ?? 0}
        totalPoints={totalPoints}
        manualScore={submission.manualScore}
        feedback={submission.feedback}
        status={submission.status}
      />
    </div>
  );
}
