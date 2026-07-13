"use client";

// Shared time-response SVG chart for the control-systems visualizations.
// Deliberately hand-rolled (no chart library, per spec §6 tech notes).

const M = { left: 11, right: 2, top: 3, bottom: 8 };
const W = 100;
const H = 52;

function niceNumber(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 1) return String(Number(v.toFixed(1)));
  return String(Number(v.toFixed(2)));
}

export function ResponseChart({
  t,
  y,
  tMax,
  yRef,
}: {
  t: number[];
  y: number[];
  tMax: number;
  /** Optional dashed reference line (e.g. the step target, 1). */
  yRef?: number;
}) {
  const dataMax = Math.max(...y, yRef ?? 0, 0.001);
  const dataMin = Math.min(...y, 0);
  const pad = (dataMax - dataMin) * 0.08;
  const yTop = dataMax + pad;
  const yBottom = dataMin < 0 ? dataMin - pad : 0;

  const px = (time: number) => M.left + (time / tMax) * (W - M.left - M.right);
  const py = (value: number) =>
    H - M.bottom - ((value - yBottom) / (yTop - yBottom)) * (H - M.top - M.bottom);

  const points = t.map((time, i) => `${px(time).toFixed(2)},${py(y[i]).toFixed(2)}`).join(" ");
  const yTicks = [...new Set([0, yRef ?? 1, yTop].map((v) => Number(v.toFixed(4))))];
  const xTicks = [0, tMax / 2, tMax];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Time response plot">
      {/* axes */}
      <line x1={M.left} y1={M.top} x2={M.left} y2={H - M.bottom} stroke="#d4d4d8" strokeWidth={0.4} />
      <line x1={M.left} y1={py(0)} x2={W - M.right} y2={py(0)} stroke="#d4d4d8" strokeWidth={0.4} />
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line x1={M.left} y1={py(v)} x2={W - M.right} y2={py(v)} stroke="#f4f4f5" strokeWidth={0.3} />
          <text x={M.left - 1.2} y={py(v) + 1} textAnchor="end" fontSize={2.8} fill="#a1a1aa">
            {niceNumber(v)}
          </text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={`x${v}`} x={px(v)} y={H - M.bottom + 4} textAnchor="middle" fontSize={2.8} fill="#a1a1aa">
          {niceNumber(v)}
        </text>
      ))}
      <text x={W - M.right} y={H - 0.8} textAnchor="end" fontSize={2.6} fill="#a1a1aa">
        t (s)
      </text>
      {yRef !== undefined && (
        <line
          x1={M.left}
          y1={py(yRef)}
          x2={W - M.right}
          y2={py(yRef)}
          stroke="#a1a1aa"
          strokeWidth={0.35}
          strokeDasharray="1.5 1.2"
        />
      )}
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={0.7} strokeLinejoin="round" />
    </svg>
  );
}

/** Compact overshoot / settling-time / final-value stats row. */
export function StepStats({
  overshootPct,
  settlingTime,
  finalValue,
  unstable,
}: {
  overshootPct: number | null;
  settlingTime: number | null;
  finalValue: number;
  unstable: boolean;
}) {
  if (unstable) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-1.5 text-center text-xs font-medium text-red-700">
        Unstable — the output grows without bound
      </p>
    );
  }
  const stat = (label: string, value: string) => (
    <span>
      <span className="text-zinc-400">{label} </span>
      <span className="font-mono font-medium text-zinc-700">{value}</span>
    </span>
  );
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs">
      {stat("overshoot", overshootPct === null ? "—" : `${overshootPct.toFixed(1)}%`)}
      {stat("settling (2%)", settlingTime === null ? "—" : `${settlingTime.toFixed(2)} s`)}
      {stat("final value", niceNumber(finalValue))}
    </div>
  );
}
