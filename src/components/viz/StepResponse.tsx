"use client";

import { useMemo, useState } from "react";
import type { z } from "zod";
import type { stepResponseProps } from "@/lib/viz/schemas";
import { formatPoly, simulateResponse, stepInfo } from "@/lib/viz/control";
import { ResponseChart, StepStats } from "./ResponseChart";
import { vizBtn, vizBtnPrimary } from "./controls";

type Props = z.infer<typeof stepResponseProps>;

export function StepResponse({ num, den, tMax: tMaxProp }: Props) {
  const [input, setInput] = useState<"step" | "impulse">("step");
  const [tMax, setTMax] = useState(tMaxProp);

  const sim = useMemo(() => simulateResponse(num, den, input, tMax), [num, den, input, tMax]);
  const info = useMemo(() => stepInfo(sim.t, sim.y), [sim]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm text-zinc-700">
          G(s) = ({formatPoly(num)}) / ({formatPoly(den)})
        </span>
        <div className="flex gap-1.5">
          {(["step", "impulse"] as const).map((kind) => (
            <button
              key={kind}
              className={input === kind ? vizBtnPrimary : vizBtn}
              onClick={() => setInput(kind)}
            >
              {kind === "step" ? "Step" : "Impulse"}
            </button>
          ))}
        </div>
      </div>
      <ResponseChart t={sim.t} y={sim.y} tMax={tMax} yRef={input === "step" ? 1 : undefined} />
      <div className="mt-2 space-y-2">
        {input === "step" && !sim.unstable ? (
          <StepStats {...info} unstable={false} />
        ) : sim.unstable ? (
          <StepStats overshootPct={null} settlingTime={null} finalValue={0} unstable />
        ) : null}
        <label className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          time span
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={tMax}
            onChange={(e) => setTMax(Number(e.target.value))}
            className="w-40 accent-blue-600"
          />
          <span className="w-8 font-mono">{tMax}s</span>
        </label>
      </div>
    </div>
  );
}
