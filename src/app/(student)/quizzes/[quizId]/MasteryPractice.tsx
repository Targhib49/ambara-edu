"use client";

import { useState, useTransition } from "react";
import { QuestionAnswerInput, type QuestionForForm } from "@/components/quiz/QuestionAnswerInput";
import { checkPracticeAnswer, restartPractice, revealPracticeSolution } from "@/lib/actions/practice";
import { runTestCases } from "@/lib/quiz/codeRunner";
import { btnPrimary, btnSecondary, cardCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

type Phase =
  | { kind: "answering" }
  | { kind: "correct"; explanation: string }
  | { kind: "wrong" }
  | { kind: "revealed"; explanation: string; answer: string };

/**
 * Mastery practice: one question at a time, checked the moment it's answered.
 * Right → it's mastered. Wrong → try again straight away, or read the solution
 * and meet the question again at the end of the queue. The run is done when
 * every question has been answered right once.
 *
 * Questions arrive without their answers; checking happens on the server, and
 * nothing here is graded.
 */
export function MasteryPractice({
  quizId,
  questions,
  initialMasteredIds,
  runs,
}: {
  quizId: string;
  /** Only questions that can be checked instantly, in authored order. */
  questions: QuestionForForm[];
  initialMasteredIds: string[];
  runs: number;
}) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [mastered, setMastered] = useState(() => new Set(initialMasteredIds));
  const [queue, setQueue] = useState(() => questions.filter((q) => !initialMasteredIds.includes(q.id)).map((q) => q.id));
  const [response, setResponse] = useState<unknown>(undefined);
  const [phase, setPhase] = useState<Phase>({ kind: "answering" });
  const [completedRuns, setCompletedRuns] = useState(runs);
  const [error, setError] = useState<string | null>(null);
  // Bumped on every fresh try, so the answer control (the code editor keeps its
  // own text) remounts empty.
  const [tryKey, setTryKey] = useState(0);

  const current = questions.find((q) => q.id === queue[0]) ?? null;
  const total = questions.length;
  const pct = total ? Math.round((mastered.size / total) * 100) : 0;

  function freshTry() {
    setResponse(undefined);
    setPhase({ kind: "answering" });
    setError(null);
    setTryKey((k) => k + 1);
  }

  function check() {
    if (!current || response === undefined) return;
    const question = current;
    startTransition(async () => {
      setError(null);
      let answer = response;
      if (question.type === "CODE") {
        // Tests run here in the browser, as they do on submit; the server
        // decides right or wrong from the results.
        const code = (response as { code?: string }).code ?? "";
        answer = { code, testResults: code.trim() ? await runTestCases(code, question.testCases) : [] };
      }
      const result = await checkPracticeAnswer(quizId, question.id, answer);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (result.correct) {
        setMastered((prev) => new Set(prev).add(question.id));
        if (result.complete && queue.length === 1) setCompletedRuns((n) => n + 1);
        setPhase({ kind: "correct", explanation: result.explanation });
      } else {
        setPhase({ kind: "wrong" });
      }
    });
  }

  function showSolution() {
    if (!current) return;
    const question = current;
    startTransition(async () => {
      const result = await revealPracticeSolution(quizId, question.id);
      if ("error" in result) setError(result.error);
      else setPhase({ kind: "revealed", explanation: result.explanation, answer: result.answer });
    });
  }

  function next() {
    // A mastered question leaves the queue; one whose solution was read goes
    // to the back, to be met again once it's no longer fresh.
    setQueue(([head, ...rest]) => (phase.kind === "revealed" ? [...rest, head] : rest));
    freshTry();
  }

  function restart() {
    startTransition(async () => {
      const result = await restartPractice(quizId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMastered(new Set());
      setQueue(questions.map((q) => q.id));
      freshTry();
    });
  }

  if (total === 0) {
    return <p className={`${cardCls} p-5 text-sm text-zinc-500`}>{t("practice.empty")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className={`${cardCls} space-y-2 px-4 py-3`}>
        <div className="flex items-center justify-between gap-3 text-xs font-medium">
          <span className="text-zinc-500">{t("practice.intro")}</span>
          <span className="shrink-0 tabular-nums text-emerald-700">
            {t("practice.progress", { n: mastered.size, total })}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {current ? (
        <div className={`${cardCls} space-y-4 p-5`}>
          <div>
            <p className="text-sm font-medium text-zinc-900">{current.prompt}</p>
            <div className="mt-3">
              <fieldset disabled={phase.kind !== "answering" || pending} className="contents">
                <QuestionAnswerInput
                  key={`${current.id}:${tryKey}`}
                  question={current}
                  response={response}
                  onChange={setResponse}
                />
              </fieldset>
            </div>
          </div>

          {phase.kind === "correct" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">{t("practice.correct")}</p>
              {phase.explanation && <p className="mt-1 whitespace-pre-line text-emerald-800">{phase.explanation}</p>}
            </div>
          )}
          {phase.kind === "wrong" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {t("practice.wrong")}
            </div>
          )}
          {phase.kind === "revealed" && (
            <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">{t("practice.answer", { answer: phase.answer })}</p>
              {phase.explanation && <p className="whitespace-pre-line">{phase.explanation}</p>}
              <p className="text-xs text-amber-700">{t("practice.comesBack")}</p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-4">
            {phase.kind === "answering" && (
              <button onClick={check} disabled={pending || response === undefined} className={btnPrimary}>
                {pending ? t("practice.checking") : t("practice.check")}
              </button>
            )}
            {phase.kind === "wrong" && (
              <>
                <button onClick={showSolution} disabled={pending} className={btnSecondary}>
                  {t("practice.showSolution")}
                </button>
                <button onClick={freshTry} disabled={pending} className={btnPrimary}>
                  {t("practice.tryAgain")}
                </button>
              </>
            )}
            {(phase.kind === "correct" || phase.kind === "revealed") && (
              <button onClick={next} className={btnPrimary}>
                {t("studentLesson.next")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-lg font-semibold text-emerald-900">{t("practice.completeTitle")}</p>
          <p className="mt-1 text-sm text-emerald-800">
            {total === 1 ? t("practice.completeBodyOne") : t("practice.completeBody", { n: total })}
          </p>
          {completedRuns > 0 && (
            <p className="mt-1 text-xs text-emerald-700">
              {completedRuns === 1 ? t("practice.runsOne") : t("practice.runs", { n: completedRuns })}
            </p>
          )}
          <button onClick={restart} disabled={pending} className={`${btnPrimary} mt-4`}>
            {pending ? t("practice.restarting") : t("practice.restart")}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
