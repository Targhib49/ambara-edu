"use client";

import { useState, useTransition } from "react";
import { QuestionAnswerInput, type QuestionForForm } from "@/components/quiz/QuestionAnswerInput";
import { checkReviewAnswer, recordReviewRun } from "@/lib/actions/practice";
import { runTestCases } from "@/lib/quiz/codeRunner";
import { btnPrimary, cardCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

type Phase = { kind: "answering" } | { kind: "checked"; correct: boolean; explanation: string };

/**
 * A mixed review set: questions drawn from earlier chapters, answered once
 * each with an instant check. Finishing the set is what marks the review done;
 * the score is kept as a best, and nothing here is graded.
 */
export function ReviewPlayer({
  quizId,
  questions,
  sourceTitles,
  initialBest,
}: {
  quizId: string;
  questions: QuestionForForm[];
  /** Which quiz each question came from, so a student can place it. */
  sourceTitles: string[];
  initialBest: number | null;
}) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState<unknown>(undefined);
  const [phase, setPhase] = useState<Phase>({ kind: "answering" });
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(initialBest);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = questions.length;
  const current = questions[index];

  if (total === 0) {
    return <p className={`${cardCls} p-5 text-sm text-zinc-500`}>{t("review.empty")}</p>;
  }

  function check() {
    if (!current || response === undefined) return;
    const question = current;
    startTransition(async () => {
      setError(null);
      let answer = response;
      if (question.type === "CODE") {
        const code = (response as { code?: string }).code ?? "";
        answer = { code, testResults: code.trim() ? await runTestCases(code, question.testCases) : [] };
      }
      const result = await checkReviewAnswer(quizId, question.id, answer);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (result.correct) setScore((n) => n + 1);
      setPhase({ kind: "checked", correct: result.correct, explanation: result.explanation });
    });
  }

  function next() {
    const finalScore = score;
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setResponse(undefined);
      setPhase({ kind: "answering" });
      return;
    }
    setDone(true);
    startTransition(async () => {
      const saved = await recordReviewRun(quizId, finalScore, total);
      if ("error" in saved) setError(saved.error);
      else setBest(saved.best);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="text-lg font-semibold text-teal-900">{t("review.doneTitle")}</p>
        <p className="mt-1 text-sm text-teal-800">{t("review.doneScore", { n: score, total })}</p>
        {best !== null && <p className="mt-1 text-xs text-teal-700">{t("review.bestScore", { n: best, total })}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <a href={`/quizzes/${quizId}`} className={`${btnPrimary} mt-4 inline-block`}>
          {t("review.again")}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${cardCls} space-y-2 px-4 py-3`}>
        <div className="flex items-center justify-between gap-3 text-xs font-medium">
          <span className="text-zinc-500">{t("review.intro")}</span>
          <span className="shrink-0 tabular-nums text-teal-700">{t("review.progress", { n: index + 1, total })}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>

      <div className={`${cardCls} space-y-4 p-5`}>
        <div>
          {sourceTitles[index] && <p className="text-xs text-zinc-400">{t("review.from", { title: sourceTitles[index] })}</p>}
          <p className="mt-1 text-sm font-medium text-zinc-900">{current.prompt}</p>
          <div className="mt-3">
            <fieldset disabled={phase.kind !== "answering" || pending} className="contents">
              <QuestionAnswerInput question={current} response={response} onChange={setResponse} />
            </fieldset>
          </div>
        </div>

        {phase.kind === "checked" && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              phase.correct ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <p className="font-semibold">{phase.correct ? t("practice.correct") : t("practice.wrong")}</p>
            {phase.explanation && <p className="mt-1 whitespace-pre-line">{phase.explanation}</p>}
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          {phase.kind === "answering" ? (
            <button onClick={check} disabled={pending || response === undefined} className={btnPrimary}>
              {pending ? t("practice.checking") : t("review.check")}
            </button>
          ) : (
            <button onClick={next} disabled={pending} className={btnPrimary}>
              {index + 1 < total ? t("review.next") : t("review.finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
