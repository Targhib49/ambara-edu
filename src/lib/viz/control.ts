/**
 * Pure control-theory math for the control-systems visualizations: polynomial
 * arithmetic, transfer-function → state-space conversion, and fixed-step RK4
 * simulation. Coefficient arrays are highest-degree-first, e.g. [1, 2, 1]
 * means s² + 2s + 1. Everything runs client-side (spec §6: compute stays in
 * the browser), but the functions themselves are environment-agnostic.
 */

/** Polynomial multiplication (convolution). */
export function polyMul(a: number[], b: number[]): number[] {
  const out = new Array<number>(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  }
  return out;
}

/** Polynomial addition, aligning the two arrays at their constant terms. */
export function polyAdd(a: number[], b: number[]): number[] {
  const n = Math.max(a.length, b.length);
  const out = new Array<number>(n).fill(0);
  for (let i = 0; i < a.length; i++) out[n - a.length + i] += a[i];
  for (let i = 0; i < b.length; i++) out[n - b.length + i] += b[i];
  return out;
}

function trimLeadingZeros(p: number[]): number[] {
  const idx = p.findIndex((c) => c !== 0);
  return idx === -1 ? [0] : p.slice(idx);
}

type StateSpace = { A: number[][]; B: number[]; C: number[] };

/**
 * Controllable-canonical state-space realization of a strictly proper
 * transfer function. The denominator's leading coefficient must be nonzero;
 * the numerator may have fewer coefficients (it's zero-padded).
 */
export function tf2ss(numRaw: number[], den: number[]): StateSpace {
  const num = trimLeadingZeros(numRaw);
  const n = den.length - 1; // system order
  if (n < 1) throw new Error("Denominator must have degree ≥ 1");
  if (num.length > n) throw new Error("Transfer function must be strictly proper");
  const a0 = den[0];
  const a = den.slice(1).map((c) => c / a0); // [a1 ... an]
  const b = [...new Array(n - num.length).fill(0), ...num.map((c) => c / a0)]; // [b1 ... bn]

  const A = Array.from({ length: n }, (_, i) =>
    i === 0 ? a.map((c) => -c) : Array.from({ length: n }, (_, j) => (j === i - 1 ? 1 : 0))
  );
  const B = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
  return { A, B, C: b };
}

export type SimResult = {
  t: number[];
  y: number[];
  /** True if the output blew up — the trace is truncated at that point. */
  unstable: boolean;
};

/**
 * Simulates a strictly proper transfer function's step or impulse response
 * with fixed-step RK4. Impulse response uses x(0) = B with zero input
 * (equivalent to the Dirac hit at t = 0).
 */
export function simulateResponse(
  num: number[],
  den: number[],
  input: "step" | "impulse",
  tMax: number,
  points = 400
): SimResult {
  const { A, B, C } = tf2ss(num, den);
  const n = B.length;
  const stepsPerPoint = 3;
  const dt = tMax / (points * stepsPerPoint);
  const u = input === "step" ? 1 : 0;

  let x = input === "impulse" ? [...B] : new Array<number>(n).fill(0);
  const deriv = (state: number[]): number[] =>
    A.map((row, i) => row.reduce((sum, aij, j) => sum + aij * state[j], 0) + B[i] * u);

  const t: number[] = [0];
  const y: number[] = [C.reduce((s, c, i) => s + c * x[i], 0)];

  for (let p = 1; p <= points; p++) {
    for (let s = 0; s < stepsPerPoint; s++) {
      const k1 = deriv(x);
      const k2 = deriv(x.map((xi, i) => xi + (dt / 2) * k1[i]));
      const k3 = deriv(x.map((xi, i) => xi + (dt / 2) * k2[i]));
      const k4 = deriv(x.map((xi, i) => xi + dt * k3[i]));
      x = x.map((xi, i) => xi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }
    const out = C.reduce((s, c, i) => s + c * x[i], 0);
    // 1e4 rather than a float-overflow bound: slow divergences (e.g. 1/(s−1))
    // should still read as unstable within a short plotting window.
    if (!Number.isFinite(out) || Math.abs(out) > 1e4) {
      return { t, y, unstable: true };
    }
    t.push((p * tMax) / points);
    y.push(out);
  }
  return { t, y, unstable: false };
}

export type StepInfo = { finalValue: number; overshootPct: number | null; settlingTime: number | null };

/** Overshoot and 2%-band settling time of a (stable) step response trace. */
export function stepInfo(t: number[], y: number[]): StepInfo {
  const finalValue = y[y.length - 1];
  if (Math.abs(finalValue) < 1e-9) return { finalValue: 0, overshootPct: null, settlingTime: null };
  const peak = Math.max(...y.map((v) => (finalValue > 0 ? v : -v)));
  const ref = Math.abs(finalValue);
  const overshootPct = Math.max(0, ((peak - ref) / ref) * 100);
  const band = 0.02 * ref;
  let settlingTime: number | null = 0;
  for (let i = y.length - 1; i >= 0; i--) {
    if (Math.abs(y[i] - finalValue) > band) {
      settlingTime = i === y.length - 1 ? null : t[i + 1]; // never settles inside the window
      break;
    }
  }
  return { finalValue, overshootPct, settlingTime };
}

const SUPERSCRIPTS = ["", "", "²", "³", "⁴", "⁵"];

/** Pretty-prints a coefficient array, e.g. [1, 2, 1] → "s² + 2s + 1". */
export function formatPoly(coeffs: number[]): string {
  const p = trimLeadingZeros(coeffs);
  const degree = p.length - 1;
  const terms: string[] = [];
  p.forEach((c, i) => {
    if (c === 0 && p.length > 1) return;
    const power = degree - i;
    const mag = Math.abs(c);
    const coefficient = power > 0 && mag === 1 ? "" : String(Number(mag.toFixed(3)));
    const sVar = power === 0 ? "" : `s${SUPERSCRIPTS[power] ?? `^${power}`}`;
    const term = `${coefficient}${sVar}` || "0";
    terms.push(c < 0 ? `− ${term}` : terms.length > 0 ? `+ ${term}` : term);
  });
  return terms.join(" ") || "0";
}
