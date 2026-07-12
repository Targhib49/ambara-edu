import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { gradeQuestion } from "@/lib/quiz/grading";
import { formatCorrectAnswer, formatResponse } from "@/lib/quiz/format";
import { submissionAnswersSchema } from "@/lib/quiz/schema";
import { CodeSubmissionView } from "@/components/quiz/CodeSubmissionView";
import { ReviewForm } from "./ReviewForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ quizId: string; submissionId: string }>;
}) {
  const { quizId, submissionId } = await params;
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: { select: { name: true } },
      quiz: { include: { questions: { orderBy: { order: "asc" } } } },
    },
  });
  if (!submission || submission.quizId !== quizId) notFound();

  const answers = submissionAnswersSchema.parse(submission.answers);
  const totalPoints = submission.quiz.questions.reduce((n, q) => n + q.points, 0);

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
        <Breadcrumbs
          items={[
            { label: "Home", href: "/tutor" },
            { label: "Quizzes", href: "/tutor/quizzes" },
            { label: submission.quiz.title, href: `/tutor/quizzes/${quizId}` },
            { label: `${submission.student.name}'s submission` },
          ]}
        />
        <h1 className="mt-2 text-2xl font-semibold">{submission.student.name}&rsquo;s submission</h1>
      </div>

      <div className="space-y-4">
        {rows.map(({ question, response, grade }, i) => (
          <div key={question.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Q{i + 1} · {question.points} pt{question.points === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm text-zinc-900">{question.prompt}</p>

            {question.type === "CODE" ? (
              <div className="mt-3">
                <CodeSubmissionView correctAnswer={question.correctAnswer} response={response} />
                {grade.earnedPoints > 0 && (
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Auto-score from tests: {grade.earnedPoints} / {question.points} pts (already counted
                    in the auto-graded score below)
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-zinc-500">Answer: </span>
                  {formatResponse(question.type, response, question.options)}
                </p>
                <p>
                  <span className="text-zinc-500">Correct answer: </span>
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
                  {grade.correct ? "Correct" : "Incorrect"} (auto-graded)
                </span>
              ) : submission.status === "REVIEWED" ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Reviewed
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Needs your review
                </span>
              )}
            </div>

            {question.explanation && (
              <p className="mt-2 text-xs text-zinc-500">Explanation: {question.explanation}</p>
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
