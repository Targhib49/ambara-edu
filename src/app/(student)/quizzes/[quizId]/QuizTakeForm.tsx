"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAnswers } from "@/lib/actions/quizzes";
import { runTestCases } from "@/lib/quiz/codeRunner";
import { QuestionAnswerInput, type QuestionForForm } from "@/components/quiz/QuestionAnswerInput";
import { useT } from "@/lib/i18n/client";

/** Untimed, all-on-one-page quiz form — used by every regular lesson quiz.
 * Timed try-outs use the separate `TimedQuizTakeForm` instead. */
export function QuizTakeForm({ quizId, questions }: { quizId: string; questions: QuestionForForm[] }) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  function setResponse(questionId: string, response: unknown) {
    setResponses((prev) => ({ ...prev, [questionId]: response }));
  }

  function handleSubmit() {
    startTransition(async () => {
      // CODE answers get their test cases run right here at submit time
      // (spec §5 v2) — the graded results are always from the submitted code,
      // never a stale preview run.
      const answers = [];
      for (const q of questions) {
        const response = responses[q.id];
        if (response === undefined) continue;
        if (q.type === "CODE") {
          const code = (response as { code?: string }).code ?? "";
          const testResults =
            code.trim() && q.testCases.length > 0 ? await runTestCases(code, q.testCases) : [];
          answers.push({ questionId: q.id, response: { code, testResults } });
        } else {
          answers.push({ questionId: q.id, response });
        }
      }
      await submitQuizAnswers(quizId, answers);
      router.push(`/quizzes/${quizId}`);
      router.refresh();
    });
  }

  const hasCodeQuestions = questions.some(
    (q) => q.type === "CODE" && q.testCases.length > 0 && responses[q.id] !== undefined
  );
  const answeredCount = questions.filter((q) => responses[q.id] !== undefined).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-zinc-500">
          {t("takeQuiz.answeredOf", { n: answeredCount, total: questions.length })}
        </span>
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {t(q.points === 1 ? "quizPage.questionLabel" : "quizPage.questionLabelPlural", { i: i + 1, p: q.points })}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{q.prompt}</p>
          <div className="mt-3">
            <QuestionAnswerInput
              question={q}
              response={responses[q.id]}
              onChange={(r) => setResponse(q.id, r)}
            />
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <span className="text-xs font-medium text-zinc-500">
          {t("takeQuiz.answeredOf", { n: answeredCount, total: questions.length })}
        </span>
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {pending
            ? hasCodeQuestions
              ? t("takeQuiz.runningAndSubmitting")
              : t("takeQuiz.submitting")
            : t("takeQuiz.submit")}
        </button>
      </div>
    </div>
  );
}
