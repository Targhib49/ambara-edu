"use client";

import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import type { loopStepperProps } from "@/lib/viz/schemas";
import { vizBtn, vizBtnPrimary } from "./controls";

type Props = z.infer<typeof loopStepperProps>;

const MAX_ITERATIONS = 60;

type LoopState = {
  line: number; // index into the code lines being highlighted
  i: number | null;
  total: number;
  note: string;
};

function buildTrace({ start, end, step, operation }: Props): LoopState[] {
  const init = operation === "sum" ? 0 : 1;
  const op = operation === "sum" ? "+" : "*";
  const states: LoopState[] = [
    { line: 0, i: null, total: init, note: `total starts at ${init}` },
  ];
  let total = init;
  let count = 0;
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    if (++count > MAX_ITERATIONS) {
      states.push({
        line: 1,
        i,
        total,
        note: `Stopped after ${MAX_ITERATIONS} iterations to keep this readable`,
      });
      return states;
    }
    states.push({ line: 1, i, total, note: `i takes the value ${i}` });
    const next = operation === "sum" ? total + i : total * i;
    states.push({
      line: 2,
      i,
      total: next,
      note: `total = ${total} ${op} ${i} = ${next}`,
    });
    total = next;
  }
  states.push({
    line: 1,
    i: states.at(-1)?.i ?? null,
    total,
    note: "range is used up — the loop ends",
  });
  states.push({ line: 3, i: states.at(-1)?.i ?? null, total, note: `prints ${total}` });
  return states;
}

export function LoopStepper(props: Props) {
  const { start, end, step, operation } = props;
  const trace = useMemo(() => buildTrace(props), [props]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const state = trace[idx];
  const atEnd = idx >= trace.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => setIdx((s) => Math.min(s + 1, trace.length - 1)), 800);
    return () => clearInterval(t);
  }, [playing, atEnd, trace.length]);

  const codeLines = [
    `total = ${operation === "sum" ? 0 : 1}`,
    `for i in range(${start}, ${end}${step === 1 ? "" : `, ${step}`}):`,
    `    total = total ${operation === "sum" ? "+" : "*"} i`,
    `print(total)`,
  ];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <pre className="overflow-x-auto rounded-md bg-zinc-900 py-3 text-xs leading-6">
          {codeLines.map((line, li) => (
            <div
              key={li}
              className={`px-4 ${li === state.line ? "bg-blue-600/40 text-white" : "text-zinc-300"}`}
            >
              {line}
            </div>
          ))}
        </pre>
        <div className="flex gap-3 sm:flex-col">
          <div className="rounded-md border border-zinc-200 px-4 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">i</p>
            <p className="font-mono text-lg font-semibold text-blue-700">{state.i ?? "—"}</p>
          </div>
          <div className="rounded-md border border-zinc-200 px-4 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">total</p>
            <p className="font-mono text-lg font-semibold text-blue-700">{state.total}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 min-h-5 text-center text-xs text-zinc-600">{state.note}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          className={vizBtn}
          onClick={() => {
            setPlaying(false);
            setIdx(0);
          }}
        >
          ⏮ Reset
        </button>
        <button
          className={vizBtn}
          disabled={idx === 0}
          onClick={() => {
            setPlaying(false);
            setIdx((s) => Math.max(0, s - 1));
          }}
        >
          ◀ Back
        </button>
        <button className={vizBtnPrimary} disabled={atEnd} onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          className={vizBtn}
          disabled={atEnd}
          onClick={() => {
            setPlaying(false);
            setIdx((s) => Math.min(trace.length - 1, s + 1));
          }}
        >
          Step ▶
        </button>
        <span className="text-xs text-zinc-400">
          {idx} / {trace.length - 1}
        </span>
      </div>
    </div>
  );
}
