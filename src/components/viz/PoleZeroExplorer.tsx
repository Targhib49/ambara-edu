"use client";

import { useMemo, useState } from "react";
import type { z } from "zod";
import type { poleZeroExplorerProps } from "@/lib/viz/schemas";
import { simulateResponse, stepInfo } from "@/lib/viz/control";
import { ResponseChart, StepStats } from "./ResponseChart";
import { vizBtn } from "./controls";

type Props = z.infer<typeof poleZeroExplorerProps>;

type Pole = { re: number; im: number };

function polesFor(zeta: number, omegaN: number): Pole[] {
  if (zeta < 1) {
    const im = omegaN * Math.sqrt(1 - zeta * zeta);
    return [
      { re: -zeta * omegaN, im },
      { re: -zeta * omegaN, im: -im },
    ];
  }
  const spread = omegaN * Math.sqrt(zeta * zeta - 1);
  return [
    { re: -zeta * omegaN + spread, im: 0 },
    { re: -zeta * omegaN - spread, im: 0 },
  ];
}

function regimeLabel(zeta: number): string {
  if (zeta === 0) return "Undamped — poles on the imaginary axis, the output oscillates forever";
  if (zeta < 1) return "Underdamped — complex poles, the response overshoots and rings";
  if (zeta < 1.02) return "Critically damped — fastest response with no overshoot";
  return "Overdamped — two real poles, slow but overshoot-free";
}

function SPlane({ poles }: { poles: Pole[] }) {
  const S = 60; // square viewBox
  const maxMag = Math.max(...poles.map((p) => Math.hypot(p.re, p.im)), 1.5);
  const range = maxMag * 1.25;
  // Real axis spans [-range, range/3] (poles here are never in the RHP);
  // imaginary axis is symmetric.
  const px = (re: number) => ((re + range) / (range + range / 3)) * S;
  const py = (im: number) => S / 2 - (im / range) * (S / 2 - 4);
  const originX = px(0);

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full" role="img" aria-label="Pole locations on the s-plane">
      {/* stable left half-plane tint */}
      <rect x={0} y={0} width={originX} height={S} fill="#f0fdf4" />
      <line x1={0} y1={S / 2} x2={S} y2={S / 2} stroke="#d4d4d8" strokeWidth={0.4} />
      <line x1={originX} y1={0} x2={originX} y2={S} stroke="#d4d4d8" strokeWidth={0.4} />
      <text x={S - 1} y={S / 2 - 1.5} textAnchor="end" fontSize={3} fill="#a1a1aa">Re</text>
      <text x={originX + 1.5} y={3.5} fontSize={3} fill="#a1a1aa">Im</text>
      <text x={2} y={S - 2} fontSize={2.8} fill="#86efac">stable region</text>
      {poles.map((p, i) => (
        <text
          key={i}
          x={px(p.re)}
          y={py(p.im) + 1.6}
          textAnchor="middle"
          fontSize={5}
          fontWeight="bold"
          fill="#3b82f6"
        >
          ×
        </text>
      ))}
    </svg>
  );
}

export function PoleZeroExplorer({ zeta: zeta0, omegaN: omegaN0 }: Props) {
  const [zeta, setZeta] = useState(zeta0);
  const [omegaN, setOmegaN] = useState(omegaN0);

  const poles = useMemo(() => polesFor(zeta, omegaN), [zeta, omegaN]);
  // Window follows the slowest pole (smallest |Re|) — for overdamped systems
  // that's the pole near the origin, not ζωₙ. Undamped (ζ=0) shows ~4 periods.
  const slowestRe = Math.min(...poles.map((p) => Math.abs(p.re)));
  const tMax =
    zeta === 0
      ? Math.min(40, (8 * Math.PI) / omegaN)
      : Math.min(40, Math.max(3, 6 / slowestRe));
  const sim = useMemo(
    () =>
      simulateResponse(
        [omegaN * omegaN],
        [1, 2 * zeta * omegaN, omegaN * omegaN],
        "step",
        tMax
      ),
    [zeta, omegaN, tMax]
  );
  const info = useMemo(() => stepInfo(sim.t, sim.y), [sim]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-zinc-700">
        Pole-zero explorer — G(s) = ωₙ² / (s² + 2ζωₙs + ωₙ²)
      </p>
      <div className="grid gap-4 sm:grid-cols-[2fr_3fr]">
        <SPlane poles={poles} />
        <div>
          <ResponseChart t={sim.t} y={sim.y} tMax={tMax} yRef={1} />
          {zeta > 0 && <StepStats {...info} unstable={sim.unstable} />}
        </div>
      </div>
      <p className="mt-2 min-h-4 text-center text-xs text-zinc-500">{regimeLabel(zeta)}</p>
      <div className="mx-auto mt-2 max-w-sm space-y-1.5">
        <label className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="w-14 font-mono">ζ (damping)</span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={zeta}
            onChange={(e) => setZeta(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="w-10 text-right font-mono">{zeta.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="w-14 font-mono">ωₙ (rad/s)</span>
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={omegaN}
            onChange={(e) => setOmegaN(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="w-10 text-right font-mono">{omegaN.toFixed(1)}</span>
        </label>
        <div className="pt-1 text-center">
          <button
            className={vizBtn}
            onClick={() => {
              setZeta(zeta0);
              setOmegaN(omegaN0);
            }}
          >
            ⏮ Reset
          </button>
        </div>
      </div>
    </div>
  );
}
