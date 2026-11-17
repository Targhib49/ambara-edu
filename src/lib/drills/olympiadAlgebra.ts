import { drillInt, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Algebra drills for the olympiad course's Aljabar levels. Built backwards
 * from the answer, so every question comes out whole.
 */

const MINUS = "−";
const signed = (n: number) => (n < 0 ? `${MINUS} ${-n}` : `+ ${n}`);
const coef = (a: number) => (a === 1 ? "x" : `${a}x`);

/** "3x + 5 = 20", then x on both sides: "5x − 7 = 2x + 8". Answers can be negative. */
export function makeLinearEquationQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  let x: number;
  do {
    x = drillInt(rand, medium ? -12 : 1, 12);
  } while (x === 0);
  const a = drillInt(rand, 2, 9);
  const b = drillInt(rand, -20, 20) || 3;
  if (!hard) return { prompt: `${coef(a)} ${signed(b)} = ${a * x + b}, x = …`, separator: "", answer: [x] };
  // a·x + b = c·x + d with c < a, so the x terms don't cancel.
  const c = drillInt(rand, 1, a - 1);
  const d = a * x + b - c * x;
  return { prompt: `${coef(a)} ${signed(b)} = ${coef(c)} ${signed(d)}, x = …`, separator: "", answer: [x] };
}

/**
 * Symmetric expressions without solving: from a + b and ab, find a² + b²,
 * then (a − b)², then a³ + b³; and at the hard end x + 1/x = k → x² + 1/x².
 */
export function makeSymmetricSumsQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  if (hard && rand() < 0.4) {
    const k = drillInt(rand, 2, 9);
    if (rand() < 0.5) return { prompt: `x + 1/x = ${k}, x² + 1/x² = …`, separator: "", answer: [k * k - 2] };
    return { prompt: `x + 1/x = ${k}, x³ + 1/x³ = …`, separator: "", answer: [k ** 3 - 3 * k] };
  }
  let a: number;
  let b: number;
  do {
    a = drillInt(rand, 1, 9);
    b = drillInt(rand, 1, 9);
  } while (a === b);
  const s = a + b;
  const p = a * b;
  const kind = hard ? drillInt(rand, 0, 2) : medium ? drillInt(rand, 0, 1) : 0;
  if (kind === 1) return { prompt: `a + b = ${s}, ab = ${p}, (a − b)² = …`, separator: "", answer: [(a - b) ** 2] };
  if (kind === 2) return { prompt: `a + b = ${s}, ab = ${p}, a³ + b³ = …`, separator: "", answer: [a ** 3 + b ** 3] };
  return { prompt: `a + b = ${s}, ab = ${p}, a² + b² = …`, separator: "", answer: [a * a + b * b] };
}
