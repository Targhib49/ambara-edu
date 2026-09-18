"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LEVELS, displayAnswer, isCorrect, makeQuestion, type Level, type Question } from "@/lib/games/mentalMath";
import { btnPrimary, btnSecondary, cardCls } from "@/components/ui/styles";
import { nowMs } from "@/lib/sessions/format";
import { useT } from "@/lib/i18n/client";

const ROUND_MS = 60_000;
const BEST_KEY = "lms:mentalMath:best";

type Answered = { prompt: string; given: string; answer: string; correct: boolean };

// Best scores per level, kept in this browser. Read through an external store
// so the numbers show on first render without an effect.
const bestListeners = new Set<() => void>();
function subscribeBest(listener: () => void) {
  bestListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    bestListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function readBestRaw() {
  try {
    return window.localStorage.getItem(BEST_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}
function saveBest(level: Level, score: number) {
  try {
    const bests = JSON.parse(readBestRaw()) as Partial<Record<Level, number>>;
    if (score <= (bests[level] ?? 0)) return;
    window.localStorage.setItem(BEST_KEY, JSON.stringify({ ...bests, [level]: score }));
    for (const listener of bestListeners) listener();
  } catch {
    // Private mode or storage blocked: the game still works, it just forgets.
  }
}

export function MentalMathGame() {
  const t = useT();
  const bestRaw = useSyncExternalStore(subscribeBest, readBestRaw, () => "{}");
  const bests = JSON.parse(bestRaw) as Partial<Record<Level, number>>;

  const [level, setLevel] = useState<Level | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [bestBefore, setBestBefore] = useState(0);
  const [flash, setFlash] = useState<"right" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const playing = level !== null && endsAt > 0;
  const remaining = playing ? Math.max(0, endsAt - now) : 0;
  const finished = playing && remaining === 0;
  const score = answered.filter((a) => a.correct).length;

  // Tick the clock while a round runs; stop the moment it ends.
  useEffect(() => {
    if (!playing || finished) return;
    const timer = setInterval(() => setNow(nowMs()), 200);
    return () => clearInterval(timer);
  }, [playing, finished]);

  useEffect(() => {
    if (finished && level) saveBest(level, score);
  }, [finished, level, score]);

  const start = (next: Level) => {
    const t = nowMs();
    setLevel(next);
    setBestBefore(bests[next] ?? 0);
    setAnswered([]);
    setInput("");
    setFlash(null);
    setQuestion(makeQuestion(next, Math.random));
    setNow(t);
    setEndsAt(t + ROUND_MS);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const backToLevels = () => {
    setLevel(null);
    setEndsAt(0);
    setQuestion(null);
  };

  const submit = (given: string) => {
    if (!question || !level || finished || given.trim() === "") return;
    const correct = isCorrect(question, given);
    setAnswered((prev) => [...prev, { prompt: question.prompt, given, answer: question.answer, correct }]);
    setFlash(correct ? "right" : "wrong");
    setTimeout(() => setFlash(null), 350);
    setInput("");
    setQuestion(makeQuestion(level, Math.random));
    inputRef.current?.focus();
  };

  // --- choose a level
  if (!playing) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-zinc-600">{t("game.rules")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => start(l.key)}
              className={`${cardCls} group flex flex-col items-start gap-1 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md`}
            >
              <span className="font-semibold text-zinc-900 group-hover:text-blue-700">{t(l.titleKey)}</span>
              <span className="text-sm text-zinc-500">{t(l.blurbKey)}</span>
              <span className="mt-2 text-xs text-zinc-500">
                {bests[l.key] ? (
                  <>
                    {t("game.yourBestLabel")} <strong className="text-zinc-800">{bests[l.key]}</strong>
                  </>
                ) : (
                  t("game.notPlayed")
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const levelInfo = LEVELS.find((l) => l.key === level)!;

  // --- results
  if (finished) {
    const accuracy = answered.length ? Math.round((score / answered.length) * 100) : 0;
    const newBest = score > bestBefore && score > 0;
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-center text-white">
          <p className="text-sm uppercase tracking-wide text-white/70">{t(levelInfo.titleKey)} · {t("game.timesUp")}</p>
          <p className="mt-1 text-5xl font-bold tabular-nums">{score}</p>
          <p className="mt-1 text-sm text-white/80">
            {t("game.resultLine", { accuracy, tried: answered.length })}
          </p>
          <p className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            {newBest ? t("game.newBest") : t("game.yourBest", { n: Math.max(bestBefore, score) })}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => start(level)} className={btnPrimary}>
            {t("game.playAgain")}
          </button>
          <button onClick={backToLevels} className={btnSecondary}>
            {t("game.changeLevel")}
          </button>
        </div>
        {answered.length > 0 && (
          <div className={`${cardCls} overflow-hidden`}>
            <p className="border-b border-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900">{t("game.yourAnswers")}</p>
            <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
              {answered.map((a, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${a.correct ? "bg-green-500" : "bg-red-500"}`}>
                    {a.correct ? "✓" : "✕"}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-zinc-700">{a.prompt}</span>
                  <span className={`font-mono ${a.correct ? "text-green-700" : "text-red-600 line-through"}`}>{displayAnswer(a.given)}</span>
                  {!a.correct && <span className="font-mono text-zinc-800">{displayAnswer(a.answer)}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // --- playing
  const seconds = Math.ceil(remaining / 1000);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{t(levelInfo.titleKey)}</span>
        <span className="tabular-nums text-zinc-500">
          {t("game.scoreLabel")} <strong className="text-zinc-900">{score}</strong>
        </span>
        <span className={`tabular-nums font-semibold ${seconds <= 10 ? "text-red-600" : "text-zinc-900"}`}>{seconds}s</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-linear ${seconds <= 10 ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${(remaining / ROUND_MS) * 100}%` }}
        />
      </div>

      <div
        aria-live="polite"
        className={`rounded-xl border-2 px-4 py-10 text-center transition-colors ${
          flash === "right" ? "border-green-400 bg-green-50" : flash === "wrong" ? "border-red-300 bg-red-50" : "border-zinc-200 bg-zinc-50"
        }`}
      >
        <p className="font-mono text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">{question?.prompt} = ?</p>
        <span className="sr-only">{flash === "right" ? t("quiz.correct") : flash === "wrong" ? t("game.notQuite") : ""}</span>
      </div>

      {question?.choices ? (
        <div className="grid grid-cols-2 gap-2">
          {question.choices.map((choice) => (
            <button key={choice} onClick={() => submit(choice)} className={`${btnSecondary} py-4 font-mono text-xl`}>
              {displayAnswer(choice)}
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex gap-2"
        >
          <button
            type="button"
            onClick={() => {
              setInput((v) => (v.startsWith("-") ? v.slice(1) : `-${v}`));
              inputRef.current?.focus();
            }}
            aria-label={t("game.toggleNegative")}
            className={`${btnSecondary} w-14 font-mono text-lg`}
          >
            ±
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9\-−]/g, ""))}
            inputMode="numeric"
            autoComplete="off"
            aria-label={t("game.yourAnswers")}
            placeholder={t("game.answerPlaceholder")}
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-4 py-3 text-center font-mono text-2xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button type="submit" className={`${btnPrimary} px-6 text-base`}>
            {t("drill.submit")}
          </button>
        </form>
      )}

      <div className="flex justify-between text-xs text-zinc-500">
        <button onClick={backToLevels} className="hover:text-zinc-800 hover:underline">
          {t("game.quitRound")}
        </button>
        <span>{t("game.pressEnter")}</span>
      </div>
    </div>
  );
}
