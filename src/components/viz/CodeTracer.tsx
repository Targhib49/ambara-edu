"use client";

import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { codeTracerProps } from "@/lib/viz/schemas";
import { vizBtn, vizBtnPrimary } from "./controls";
import { useT } from "@/lib/i18n/client";

type Props = z.infer<typeof codeTracerProps>;

/**
 * Steps through a short Python program the way a beginner should read one:
 * the line about to run is highlighted, the variables show their values right
 * now, and the output grows as print() runs. Conditions and loop tests carry a
 * note saying what they evaluated to, which is the whole point of tracing an
 * if or a while.
 *
 * With a `predict` question, the trace stays closed until the student has
 * guessed the output — guessing first is what makes the trace stick.
 */
export function CodeTracer({ title, code, stdin, steps, predict }: Props) {
  const t = useT();
  const lines = code.split("\n");
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const open = !predict || choice !== null;

  const step = steps[idx];
  const prev = idx > 0 ? steps[idx - 1] : null;
  const atEnd = idx >= steps.length - 1;
  const running = playing && !atEnd;
  const changed = new Set(step.vars.filter(([name, value]) => prev?.vars.find(([n]) => n === name)?.[1] !== value).map(([name]) => name));

  const codeRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const pane = codeRef.current;
    const active = pane?.querySelector<HTMLElement>("[data-active]");
    if (!pane || !active) return;
    const top = active.offsetTop;
    if (top < pane.scrollTop || top + active.offsetHeight > pane.scrollTop + pane.clientHeight) {
      pane.scrollTo({ top: Math.max(0, top - pane.clientHeight / 3), behavior: "smooth" });
    }
  }, [step.line]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), 1400);
    return () => clearInterval(timer);
  }, [running, steps.length]);

  const go = (i: number) => {
    setPlaying(false);
    setIdx(Math.max(0, Math.min(steps.length - 1, i)));
  };

  return (
    // Sized by its own width, not the screen's: lessons sit in a narrow column beside the outline.
    <div className="@container rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-ink">{t("viz.trace.badge")}</span>
        {title && <p className="text-sm font-medium text-ink">{title}</p>}
      </div>

      {stdin && (
        <p className="mb-2 text-xs text-ink-muted">
          {t("viz.trace.input", { input: stdin.trim().split("\n").join(" ⏎ ") })}
        </p>
      )}

      <div className={open ? "grid grid-cols-[minmax(0,1fr)] gap-4 @xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : ""}>
        <pre ref={codeRef} className="relative max-h-[26rem] overflow-auto rounded-control bg-zinc-900 py-3 text-xs leading-6">
          {lines.map((line, i) => {
            const active = open && i + 1 === step.line;
            return (
              <div key={i} data-active={active ? "" : undefined} className={`flex px-3 ${active ? "bg-blue-600/40 text-white" : "text-zinc-300"}`}>
                <span className="mr-3 w-5 shrink-0 select-none text-right text-zinc-500">{active ? "➜" : i + 1}</span>
                <span className="whitespace-pre">{line || " "}</span>
              </div>
            );
          })}
        </pre>

        {open && (
          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{t("viz.trace.vars")}</p>
              <div className="mt-1.5 space-y-1">
                {step.vars.length === 0 ? (
                  <p className="text-xs italic text-ink-faint">{t("viz.trace.noVars")}</p>
                ) : (
                  step.vars.map(([name, value]) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between gap-3 rounded-control border px-3 py-1.5 font-mono text-xs transition-colors ${
                        changed.has(name) ? "border-warning-line bg-warning-wash" : "border-line-soft bg-surface-muted"
                      }`}
                    >
                      <span className="text-ink-soft">{name}</span>
                      <span className="min-w-0 truncate font-semibold text-ink" title={value}>
                        {value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{t("viz.life.output")}</p>
              <pre className="mt-1.5 min-h-9 whitespace-pre-wrap break-all rounded-control bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100">
                {step.output || " "}
              </pre>
            </div>
          </div>
        )}
      </div>

      {predict && (
        <div className="mt-4 rounded-control border border-brand-line bg-brand-soft/40 p-3">
          <p className="text-sm font-medium text-ink">🤔 {predict.question}</p>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2 @sm:grid-cols-2">
            {predict.options.map((option, i) => {
              const picked = choice === i;
              const right = i === predict.answer;
              const tone =
                choice === null
                  ? "border-line bg-surface hover:border-brand-line"
                  : right
                    ? "border-success-line bg-success-wash"
                    : picked
                      ? "border-danger-line bg-danger-wash"
                      : "border-line-soft bg-surface opacity-60";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={choice !== null}
                  onClick={() => {
                    setChoice(i);
                    go(0);
                  }}
                  className={`rounded-control border px-3 py-2 text-left font-mono text-xs whitespace-pre-wrap text-ink ${tone}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {choice !== null && (
            <p role="status" className="mt-2 text-sm text-ink-soft">
              <span className={`font-semibold ${choice === predict.answer ? "text-success-ink" : "text-danger-ink"}`}>
                {choice === predict.answer ? t("viz.trace.right") : t("viz.trace.wrong")}
              </span>{" "}
              {predict.explanation} {t("viz.trace.nowTrace")}
            </p>
          )}
        </div>
      )}

      {open && (
        <>
          <p className="mt-3 min-h-10 text-center text-sm text-ink-soft">
            {step.note || (step.line === 0 ? t("viz.trace.done") : t("viz.trace.next", { line: step.line }))}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button type="button" className={vizBtn} onClick={() => go(0)}>
              {t("viz.reset")}
            </button>
            <button type="button" className={vizBtn} disabled={idx === 0} onClick={() => go(idx - 1)}>
              {t("viz.back")}
            </button>
            <button type="button" className={vizBtnPrimary} disabled={atEnd} onClick={() => setPlaying((p) => !p)}>
              {running ? t("viz.pause") : t("viz.play")}
            </button>
            <button type="button" className={vizBtn} disabled={atEnd} onClick={() => go(idx + 1)}>
              {t("viz.step")}
            </button>
            <span className="text-xs tabular-nums text-ink-faint">
              {idx + 1} / {steps.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
