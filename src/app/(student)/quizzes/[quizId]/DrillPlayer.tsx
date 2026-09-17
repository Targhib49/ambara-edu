"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { DRILL_SKILLS, isDrillAnswerCorrect, type DrillSkill } from "@/lib/drills/registry";
import type { DrillQuestion } from "@/lib/drills/types";
import { recordDrillRound, type DrillRoundResult } from "@/lib/actions/practice";
import { btnPrimary, cardCls } from "@/components/ui/styles";
import { nowMs } from "@/lib/sessions/format";
import { useT } from "@/lib/i18n/client";

type Phase = "ready" | "playing" | "done";
type Flash = { correct: true } | { correct: false; text: string };

/**
 * A fluency drill round: fresh generated questions against the clock, marked
 * instantly in the browser, with the score recorded once the round ends.
 * Answers go into one small box per part ("2 : 3"); Enter submits, and typing
 * ":" or a space jumps to the next box.
 */
export function DrillPlayer({
  quizId,
  skill,
  seconds,
  target,
  initialBest,
}: {
  quizId: string;
  skill: DrillSkill;
  seconds: number;
  target: number;
  initialBest: number | null;
}) {
  const t = useT();
  const definition = DRILL_SKILLS[skill];
  const [phase, setPhase] = useState<Phase>("ready");
  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [inputs, setInputs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [best, setBest] = useState(initialBest);
  const [result, setResult] = useState<DrillRoundResult | null>(null);
  const [saving, startSaving] = useTransition();

  // The interval outlives renders, so it reads these through refs.
  const scoreRef = useRef(0);
  const indexRef = useRef(0);
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);

  const remainingMs = phase === "playing" ? Math.max(0, endsAt - now) : 0;

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      const time = nowMs();
      setNow(time);
      if (time < endsAt) return;
      clearInterval(timer);
      setPhase("done");
      startSaving(async () => {
        const saved = await recordDrillRound(quizId, scoreRef.current);
        setResult(saved);
        if (!("error" in saved)) setBest(saved.best);
      });
    }, 200);
    return () => clearInterval(timer);
  }, [phase, endsAt, quizId]);

  function nextQuestion(index: number) {
    const q = definition.make(index, Math.random);
    setQuestion(q);
    setInputs(q.answer.map(() => ""));
    requestAnimationFrame(() => boxRefs.current[0]?.focus());
  }

  function start() {
    const time = nowMs();
    scoreRef.current = 0;
    indexRef.current = 0;
    setScore(0);
    setFlash(null);
    setResult(null);
    setNow(time);
    setEndsAt(time + seconds * 1000);
    setPhase("playing");
    nextQuestion(0);
  }

  function submit() {
    if (!question || phase !== "playing" || inputs.some((v) => v === "")) return;
    const correct = isDrillAnswerCorrect(question, inputs.map(Number));
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFlash({ correct: true });
    } else {
      setFlash({ correct: false, text: `${question.prompt} = ${question.answer.join(` ${question.separator} `)}` });
    }
    indexRef.current += 1;
    nextQuestion(indexRef.current);
  }

  function onBoxKey(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if ((event.key === ":" || event.key === " ") && index < inputs.length - 1) {
      event.preventDefault();
      boxRefs.current[index + 1]?.focus();
    }
  }

  if (phase === "ready" || (phase === "done" && !question)) {
    return (
      <div className={`${cardCls} space-y-3 p-6 text-center`}>
        <p className="text-lg font-semibold text-zinc-900">{t(definition.labelKey)}</p>
        <p className="text-sm text-zinc-600">{t("drill.intro")}</p>
        <p className="text-sm text-zinc-500">
          {t("drill.target", { n: target })} · {best !== null ? t("drill.best", { n: best }) : t("drill.noBest")}
        </p>
        <button onClick={start} className={btnPrimary}>
          {t("drill.start")}
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const saved = result && !("error" in result) ? result : null;
    return (
      <div className={`${cardCls} space-y-3 p-6 text-center`}>
        <p className="text-lg font-semibold text-zinc-900">{t("drill.roundOver")}</p>
        <p className="text-3xl font-semibold tabular-nums text-zinc-900">{score}</p>
        <p className="text-sm text-zinc-600">{t("drill.resultScore", { n: score })}</p>
        {score >= target ? (
          <p className="text-sm font-medium text-emerald-700">{t("drill.targetReached")}</p>
        ) : (
          <p className="text-sm text-zinc-500">{t("drill.targetMissed", { n: target - score })}</p>
        )}
        {saved?.newBest && <p className="text-sm font-medium text-amber-700">{t("drill.newBest")}</p>}
        {result && "error" in result && <p className="text-sm text-red-600">{result.error}</p>}
        <p className="text-xs text-zinc-500">{best !== null ? t("drill.best", { n: best }) : t("drill.noBest")}</p>
        <button onClick={start} disabled={saving} className={btnPrimary}>
          {saving ? t("action.saving") : t("drill.playAgain")}
        </button>
      </div>
    );
  }

  const secondsLeft = Math.ceil(remainingMs / 1000);
  return (
    <div className={`${cardCls} space-y-5 p-6`}>
      <div className="flex items-center justify-between text-sm font-medium">
        <span className={`tabular-nums ${secondsLeft <= 10 ? "text-red-600" : "text-zinc-600"}`}>
          ⏱ {t("drill.secondsLeft", { s: secondsLeft })}
        </span>
        <span className={`tabular-nums ${score >= target ? "text-emerald-700" : "text-amber-700"}`}>
          {t("drill.score", { n: score })}
          {score >= target ? " ✓" : ` / ${target}`}
        </span>
      </div>

      <div className="text-center">
        <p className="text-xs uppercase tracking-wide text-zinc-400">{t(definition.instructionKey)}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">{question?.prompt}</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center justify-center gap-2"
      >
        {inputs.map((value, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-2xl font-semibold text-zinc-400">{question?.separator}</span>}
            <input
              ref={(el) => {
                boxRefs.current[i] = el;
              }}
              value={value}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                setInputs((prev) => prev.map((v, j) => (j === i ? digits : v)));
              }}
              onKeyDown={(event) => onBoxKey(i, event)}
              inputMode="numeric"
              autoComplete="off"
              aria-label={t("drill.answerAria", { n: i + 1 })}
              className="h-14 w-20 rounded-lg border border-zinc-300 text-center text-2xl font-semibold tabular-nums focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </span>
        ))}
        <button className={`${btnPrimary} ml-2 h-14`}>{t("drill.submit")}</button>
      </form>

      <p className={`h-5 text-center text-sm ${flash?.correct ? "text-emerald-600" : "text-red-600"}`}>
        {flash ? (flash.correct ? "✓" : `✗ ${flash.text}`) : t("game.pressEnter")}
      </p>
    </div>
  );
}
