"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAnswers } from "@/lib/actions/quizzes";
import { runTestCases } from "@/lib/quiz/codeRunner";
import type { TestCase } from "@/lib/quiz/schema";
import { CodeAnswer } from "@/components/quiz/CodeAnswer";
import type { QuestionType } from "@/generated/prisma/enums";

type QuestionForForm = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options: string[];
  testCases: TestCase[]; // CODE questions only, [] otherwise
};

const LETTERS = ["A", "B", "C", "D"] as const;

function useCountdown(startedAt: string | undefined, timeLimitMinutes: number | undefined) {
  const deadlineMs =
    startedAt && timeLimitMinutes ? new Date(startedAt).getTime() + timeLimitMinutes * 60_000 : null;
  const [remainingMs, setRemainingMs] = useState(() => (deadlineMs ? deadlineMs - Date.now() : null));

  useEffect(() => {
    if (!deadlineMs) return;
    const tick = () => setRemainingMs(Math.max(0, deadlineMs - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineMs]);

  return remainingMs; // null when untimed, else clamped to >= 0
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function QuizTakeForm({
  quizId,
  questions,
  startedAt,
  timeLimitMinutes,
}: {
  quizId: string;
  questions: QuestionForForm[];
  /** Present only for timed try-outs — set server-side when the attempt started. */
  startedAt?: string;
  timeLimitMinutes?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const remainingMs = useCountdown(startedAt, timeLimitMinutes);
  const autoSubmittedRef = useRef(false);

  function setResponse(questionId: string, response: unknown) {
    setResponses((prev) => ({ ...prev, [questionId]: response }));
  }

  function toggleMultiSelect(questionId: string, letter: string) {
    setResponses((prev) => {
      const current = (prev[questionId] as { letters?: string[] } | undefined)?.letters ?? [];
      const letters = current.includes(letter) ? current.filter((l) => l !== letter) : [...current, letter];
      return { ...prev, [questionId]: { letters } };
    });
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

  // Auto-submit exactly once when the clock runs out, whatever's answered so
  // far — the same handleSubmit path a manual click would take.
  useEffect(() => {
    if (remainingMs === 0 && !autoSubmittedRef.current && !pending) {
      autoSubmittedRef.current = true;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  const hasCodeQuestions = questions.some(
    (q) => q.type === "CODE" && q.testCases.length > 0 && responses[q.id] !== undefined
  );
  const timeExpired = remainingMs === 0;
  const timeLow = remainingMs !== null && remainingMs > 0 && remainingMs <= 5 * 60_000;
  const answeredCount = questions.filter((q) => responses[q.id] !== undefined).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="space-y-4 pb-20">
      {remainingMs !== null && (
        <div
          className={`sticky top-0 z-10 flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm ${
            timeLow ? "border-red-300 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <span>{timeExpired ? "Time's up — submitting…" : "Time remaining"}</span>
          <span className="font-mono text-base tabular-nums">{formatCountdown(remainingMs)}</span>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-zinc-500">
          {answeredCount} / {questions.length} answered
        </span>
      </div>

      <fieldset disabled={timeExpired} className="contents">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Q{i + 1} · {q.points} pt{q.points === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{q.prompt}</p>

          <div className="mt-3 space-y-2">
            {q.type === "MULTIPLE_CHOICE" &&
              q.options.map((opt, oi) => {
                const selected = (responses[q.id] as { letter?: string } | undefined)?.letter === LETTERS[oi];
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setResponse(q.id, { letter: LETTERS[oi] })}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                        selected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-400"
                      }`}
                    >
                      {selected ? "✓" : LETTERS[oi]}
                    </span>
                    {opt}
                  </button>
                );
              })}

            {q.type === "MULTI_SELECT" &&
              q.options.map((opt, oi) => {
                const selected = (
                  (responses[q.id] as { letters?: string[] } | undefined)?.letters ?? []
                ).includes(LETTERS[oi]);
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => toggleMultiSelect(q.id, LETTERS[oi])}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-medium ${
                        selected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-400"
                      }`}
                    >
                      {selected ? "✓" : LETTERS[oi]}
                    </span>
                    {opt}
                  </button>
                );
              })}

            {q.type === "NUMERIC" && (
              <input
                type="number"
                step="any"
                onChange={(e) => setResponse(q.id, { value: Number(e.target.value) })}
                className="w-40 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}

            {q.type === "SHORT_TEXT" && (
              <input
                type="text"
                onChange={(e) => setResponse(q.id, { value: e.target.value })}
                className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}

            {q.type === "CODE" && (
              <CodeAnswer
                testCases={q.testCases}
                onCodeChange={(code) => setResponse(q.id, { code })}
              />
            )}
          </div>
        </div>
      ))}
      </fieldset>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <span className="text-xs font-medium text-zinc-500">
          {answeredCount} / {questions.length} answered
        </span>
        <button
          onClick={handleSubmit}
          disabled={pending || timeExpired}
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
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
    </div>
  );
}
