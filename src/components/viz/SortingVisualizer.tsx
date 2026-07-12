"use client";

import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import type { sortingVisualizerProps } from "@/lib/viz/schemas";
import { vizBtn, vizBtnPrimary } from "./controls";

type Props = z.infer<typeof sortingVisualizerProps>;

type SortStep = {
  array: number[];
  compare: number[]; // indices currently being looked at
  sorted: number[]; // indices locked in their final position
  note: string;
};

function bubbleSteps(input: number[]): SortStep[] {
  const a = [...input];
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  for (let pass = 0; pass < a.length - 1; pass++) {
    for (let j = 0; j < a.length - 1 - pass; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          compare: [j, j + 1],
          sorted: [...sorted],
          note: `${a[j + 1]} > ${a[j]} — swap them`,
        });
      } else {
        steps.push({
          array: [...a],
          compare: [j, j + 1],
          sorted: [...sorted],
          note: `${a[j]} ≤ ${a[j + 1]} — already in order`,
        });
      }
    }
    sorted.push(a.length - 1 - pass);
    steps.push({
      array: [...a],
      compare: [],
      sorted: [...sorted],
      note: `Pass ${pass + 1} done — ${a[a.length - 1 - pass]} is in its final place`,
    });
  }
  return steps;
}

function selectionSteps(input: number[]): SortStep[] {
  const a = [...input];
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      steps.push({
        array: [...a],
        compare: [min, j],
        sorted: [...sorted],
        note: `Is ${a[j]} smaller than ${a[min]}?${a[j] < a[min] ? " Yes — new minimum" : " No"}`,
      });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
    sorted.push(i);
    steps.push({
      array: [...a],
      compare: [],
      sorted: [...sorted],
      note: `Smallest of the rest is ${a[i]} — it goes to position ${i + 1}`,
    });
  }
  return steps;
}

function insertionSteps(input: number[]): SortStep[] {
  const a = [...input];
  const steps: SortStep[] = [];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    steps.push({
      array: [...a],
      compare: [i],
      sorted: [],
      note: `Take ${a[i]} and walk it left until it fits`,
    });
    while (j > 0 && a[j - 1] > a[j]) {
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      j--;
      steps.push({
        array: [...a],
        compare: [j, j + 1],
        sorted: [],
        note: `${a[j]} < ${a[j + 1]} — shift it left`,
      });
    }
  }
  return steps;
}

const STEP_GENERATORS: Record<Props["algorithm"], (a: number[]) => SortStep[]> = {
  bubble: bubbleSteps,
  selection: selectionSteps,
  insertion: insertionSteps,
};

const ALGORITHM_LABELS: Record<Props["algorithm"], string> = {
  bubble: "Bubble sort",
  selection: "Selection sort",
  insertion: "Insertion sort",
};

function shuffle(values: number[]): number[] {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SortingVisualizer({ algorithm, values }: Props) {
  const [order, setOrder] = useState(values);
  const [stepIdx, setStepIdx] = useState(0); // 0 = initial state, n = after steps[n-1]
  const [playing, setPlaying] = useState(false);

  const steps = useMemo(() => {
    const generated = STEP_GENERATORS[algorithm](order);
    generated.push({
      array: [...order].sort((x, y) => x - y),
      compare: [],
      sorted: order.map((_, i) => i),
      note: "Done — the array is sorted!",
    });
    return generated;
  }, [algorithm, order]);

  const current: SortStep =
    stepIdx === 0
      ? { array: order, compare: [], sorted: [], note: "Press Play, or Step through it" }
      : steps[stepIdx - 1];
  const atEnd = stepIdx >= steps.length;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => setStepIdx((s) => Math.min(s + 1, steps.length)), 500);
    return () => clearInterval(t);
  }, [playing, atEnd, steps.length]);

  const max = Math.max(...current.array);
  const barW = 100 / current.array.length;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-700">{ALGORITHM_LABELS[algorithm]}</span>
        <span className="text-xs text-zinc-400">
          Step {stepIdx} / {steps.length}
        </span>
      </div>
      <svg viewBox="0 0 100 46" className="w-full" role="img" aria-label="Bar chart of the array being sorted">
        {current.array.map((v, i) => {
          const fill = current.sorted.includes(i)
            ? "#22c55e" // locked in place — green
            : current.compare.includes(i)
              ? "#f59e0b" // being compared — amber
              : "#3b82f6"; // default — blue
          const h = (v / max) * 36;
          return (
            <g key={i}>
              <rect
                x={i * barW + barW * 0.1}
                y={40 - h}
                width={barW * 0.8}
                height={h}
                rx={0.6}
                fill={fill}
              />
              <text
                x={i * barW + barW / 2}
                y={44.5}
                textAnchor="middle"
                fontSize={3}
                fill="#71717a"
              >
                {v}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 min-h-5 text-center text-xs text-zinc-600">{current.note}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          className={vizBtn}
          onClick={() => {
            setPlaying(false);
            setStepIdx(0);
          }}
        >
          ⏮ Reset
        </button>
        <button
          className={vizBtn}
          disabled={stepIdx === 0}
          onClick={() => {
            setPlaying(false);
            setStepIdx((s) => Math.max(0, s - 1));
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
            setStepIdx((s) => Math.min(steps.length, s + 1));
          }}
        >
          Step ▶
        </button>
        <button
          className={vizBtn}
          onClick={() => {
            setPlaying(false);
            setStepIdx(0);
            setOrder(shuffle(order));
          }}
        >
          🔀 Shuffle
        </button>
      </div>
    </div>
  );
}
