import { drillInt, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Counting drills for the olympiad course's Kombinatorika levels: factorials,
 * permutations and combinations, and inclusion–exclusion on 1…N.
 */

const pick = <T,>(rand: Rand, items: readonly T[]): T => items[drillInt(rand, 0, items.length - 1)];

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const perm = (n: number, r: number) => factorial(n) / factorial(n - r);
const comb = (n: number, r: number) => perm(n, r) / factorial(r);

/** "5!", "P(7, 2)", "C(8, 3)" — every answer fits the four-digit box. */
export function makeCountingQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const kind = medium ? drillInt(rand, 0, 2) : drillInt(rand, 0, 1);
  if (kind === 0 && !hard) {
    const n = drillInt(rand, 3, 7);
    return { prompt: `${n}!`, separator: "", answer: [factorial(n)] };
  }
  if (kind === 1 || (kind === 0 && hard)) {
    let n: number;
    let r: number;
    do {
      n = drillInt(rand, 4, hard ? 12 : 9);
      r = drillInt(rand, 2, hard ? 4 : 3);
    } while (r > n || perm(n, r) > 9999);
    return { prompt: `P(${n}, ${r})`, separator: "", answer: [perm(n, r)] };
  }
  let n: number;
  let r: number;
  do {
    n = drillInt(rand, 5, hard ? 16 : 10);
    r = drillInt(rand, 2, hard ? 5 : 3);
  } while (r >= n || comb(n, r) > 9999);
  return { prompt: `C(${n}, ${r})`, separator: "", answer: [comb(n, r)] };
}

/** "1–100, habis dibagi 3 atau 5", then the complement: "… bukan kelipatan 2 maupun 3". */
export function makeInclusionExclusionQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const [p, q] = pick(rand, [
    [2, 3],
    [2, 5],
    [3, 5],
    [2, 7],
    [3, 7],
    [5, 7],
  ] as const);
  const n = pick(rand, hard ? [100, 200, 500, 1000] : medium ? [60, 100, 120, 200] : [30, 50, 60, 100]);
  const either = Math.floor(n / p) + Math.floor(n / q) - Math.floor(n / (p * q));
  if (medium && rand() < 0.5) return { prompt: `1–${n}, bukan kelipatan ${p} maupun ${q}`, separator: "", answer: [n - either] };
  return { prompt: `1–${n}, kelipatan ${p} atau ${q}`, separator: "", answer: [either] };
}
