"use client";

import { useMemo, useState } from "react";
import type { z } from "zod";
import type { pidTuningProps } from "@/lib/viz/schemas";
import { formatPoly, polyAdd, polyMul, simulateResponse, stepInfo } from "@/lib/viz/control";
import { ResponseChart, StepStats } from "./ResponseChart";
import { vizBtn } from "./controls";

type Props = z.infer<typeof pidTuningProps>;

const T_MAX = 15;

/**
 * Closed-loop step response of plant G with an ideal PID controller
 * C(s) = (Kd·s² + Kp·s + Ki) / s under unity feedback:
 * CL = CG / (1 + CG). The schema's relative-degree-≥-2 constraint on the
 * plant keeps CL strictly proper, so tf2ss never sees an improper system.
 */
function closedLoop(plantNum: number[], plantDen: number[], kp: number, ki: number, kd: number) {
  const cgNum = polyMul([kd, kp, ki], plantNum);
  const cgDen = polyMul([1, 0], plantDen);
  return { num: cgNum, den: polyAdd(cgDen, cgNum) };
}

function GainSlider({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-600">
      <span className="w-6 font-mono font-medium">{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-600"
      />
      <span className="w-10 text-right font-mono">{value.toFixed(1)}</span>
    </label>
  );
}

export function PidTuning({ plantNum, plantDen, kp: kp0, ki: ki0, kd: kd0 }: Props) {
  const [kp, setKp] = useState(kp0);
  const [ki, setKi] = useState(ki0);
  const [kd, setKd] = useState(kd0);

  const sim = useMemo(() => {
    const { num, den } = closedLoop(plantNum, plantDen, kp, ki, kd);
    return simulateResponse(num, den, "step", T_MAX);
  }, [plantNum, plantDen, kp, ki, kd]);
  const info = useMemo(() => stepInfo(sim.t, sim.y), [sim]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-700">PID tuning — closed-loop step response</span>
        <span className="font-mono text-xs text-zinc-500">
          plant: ({formatPoly(plantNum)}) / ({formatPoly(plantDen)})
        </span>
      </div>
      <ResponseChart t={sim.t} y={sim.y} tMax={T_MAX} yRef={1} />
      <div className="mt-2">
        <StepStats {...info} unstable={sim.unstable} />
      </div>
      <div className="mx-auto mt-3 max-w-sm space-y-1.5">
        <GainSlider label="Kp" value={kp} max={Math.max(10, kp0)} onChange={setKp} />
        <GainSlider label="Ki" value={ki} max={Math.max(5, ki0)} onChange={setKi} />
        <GainSlider label="Kd" value={kd} max={Math.max(5, kd0)} onChange={setKd} />
        <div className="pt-1 text-center">
          <button
            className={vizBtn}
            onClick={() => {
              setKp(kp0);
              setKi(ki0);
              setKd(kd0);
            }}
          >
            ⏮ Reset gains
          </button>
        </div>
      </div>
    </div>
  );
}
