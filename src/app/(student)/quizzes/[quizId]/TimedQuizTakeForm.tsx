"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAnswers } from "@/lib/actions/quizzes";
import { runTestCases } from "@/lib/quiz/codeRunner";
import { useCountdown, formatCountdown } from "@/lib/quiz/countdown";
import { QuestionAnswerInput, type QuestionForForm } from "@/components/quiz/QuestionAnswerInput";

/**
 * One-question-at-a-time exam flow for timed try-outs — the countdown and a
 * jump-to-any-question navigator stay visible in a sticky header throughout.
 * Untimed quizzes use the separate, simpler `QuizTakeForm` instead; this
 * component only exists for the `timedSession` branch in the quiz page.
 */
export function TimedQuizTakeForm({
  quizId,
  questions,
  startedAt,
  timeLimitMinutes,
}: {
  quizId: string;
  questions: QuestionForForm[];
  startedAt: string;
  timeLimitMinutes: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const remainingMs = useCountdown(startedAt, timeLimitMinutes);
  const autoSubmittedRef = useRef(false);

  function setResponse(questionId: string, response: unknown) {
    setResponses((prev) => ({ ...prev, [questionId]: response }));
  }

  function handleSubmit() {
    startTransition(async () => {
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

  // Auto-submit exactly once when the clock runs out, whatever's answered so
  // far — regardless of which question is currently on screen.
  useEffect(() => {
    if (remainingMs === 0 && !autoSubmittedRef.current && !pending) {
      autoSubmittedRef.current = true;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  const timeExpired = remainingMs === 0;
  const timeLow = remainingMs !== null && remainingMs > 0 && remainingMs <= 5 * 60_000;
  const answeredCount = questions.filter((q) => responses[q.id] !== undefined).length;
  const hasCodeQuestions = questions.some(
    (q) => q.type === "CODE" && q.testCases.length > 0 && responses[q.id] !== undefined
  );
  const question = questions[currentIndex];

  return (
    <div className="space-y-4 pb-8">
      <div
        className={`sticky top-0 z-10 space-y-3 rounded-xl border px-4 py-3 shadow-sm ${
          timeLow ? "border-red-300 bg-red-50" : "border-blue-200 bg-blue-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`text-sm font-medium ${timeLow ? "text-red-800" : "text-blue-800"}`}>
            {timeExpired ? "Time's up — submitting…" : "Time remaining"}
          </span>
          <span className={`font-mono text-base tabular-nums ${timeLow ? "text-red-800" : "text-blue-800"}`}>
            {formatCountdown(remainingMs ?? 0)}
          </span>
          <button
            onClick={handleSubmit}
            disabled={pending || timeExpired}
            className="shrink-0 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending
              ? hasCodeQuestions
                ? "Running tests & submitting…"
                : "Submitting…"
              : timeExpired
                ? "Time's up"
                : "Submit quiz"}
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-blue-700">
          <span>
            Question {currentIndex + 1} / {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const answered = responses[q.id] !== undefined;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-medium transition ${
                  isCurrent
                    ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1"
                    : answered
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "border border-zinc-300 bg-white text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <fieldset disabled={timeExpired} className="contents">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Q{currentIndex + 1} · {question.points} pt{question.points === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{question.prompt}</p>
          <div className="mt-3">
            <QuestionAnswerInput
              question={question}
              response={responses[question.id]}
              onChange={(r) => setResponse(question.id, r)}
            />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
