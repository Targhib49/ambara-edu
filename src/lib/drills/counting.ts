import { drillInt, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Counting drills for the olympiad course's Kombinatorika levels: factorials,
 * permutations and combinations, and inclusion–exclusion on 1…N.
 */

const pick = <T,>(rand: Rand, items: readonly T[]): T => items[drillInt(rand, 0, items.length - 1)];

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
/** n · (n − 1) · … · (n − r + 1), multiplied out so it stays exact. */
const perm = (n: number, r: number) => {
  let result = 1;
  for (let i = 0; i < r; i++) result *= n - i;
  return result;
};
/** Built up one factor at a time; each partial result is itself a binomial, so every division is exact. */
const comb = (n: number, r: number) => {
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
};

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

/**
 * Handshakes, round-robin matches and polygon diagonals — all C(n, 2) in
 * disguise — and, later in the round, the same idea run backwards.
 */
export function makeHandshakesQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const kind = hard ? drillInt(rand, 0, 3) : medium ? drillInt(rand, 0, 2) : 0;
  if (kind === 0) {
    const n = drillInt(rand, 4, medium ? 30 : 12);
    return { prompt: `${n} orang saling berjabat tangan: … jabat tangan`, separator: "", answer: [comb(n, 2)] };
  }
  if (kind === 1) {
    const n = drillInt(rand, 5, 24);
    return { prompt: `${n} tim, setiap dua tim bertanding sekali: … pertandingan`, separator: "", answer: [comb(n, 2)] };
  }
  if (kind === 2) {
    const n = drillInt(rand, 5, medium ? 30 : 12);
    return { prompt: `Banyak diagonal segi-${n}: …`, separator: "", answer: [(n * (n - 3)) / 2] };
  }
  const n = drillInt(rand, 6, 40);
  return { prompt: `Ada ${comb(n, 2)} jabat tangan, jadi ada … orang`, separator: "", answer: [n] };
}

/**
 * Shortest routes on a grid, from the bottom-left corner to the top-right,
 * moving only right or up: C(m + n, m). Late in the round the route has to
 * pass through a given point, which multiplies two such counts.
 */
export function makeGridPathsQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const m = drillInt(rand, medium ? 3 : 1, hard ? 7 : medium ? 5 : 4);
  const n = drillInt(rand, medium ? 2 : 1, hard ? 6 : medium ? 5 : 3);
  if (hard && m >= 2 && n >= 2) {
    const a = drillInt(rand, 1, m - 1);
    const b = drillInt(rand, 1, n - 1);
    const via = comb(a + b, a) * comb(m - a + (n - b), m - a);
    return { prompt: `Grid ${m} × ${n}, lewat titik (${a}, ${b}): … rute`, separator: "", answer: [via] };
  }
  return { prompt: `Grid ${m} × ${n}: … rute terpendek`, separator: "", answer: [comb(m + n, m)] };
}

// Ordinary words with repeated letters; anything whose count passes 9999 is skipped.
const WORDS_EASY = ["BUKU", "KAKI", "MAMA", "SUSU", "KATA", "ANGKA", "TOMAT", "SUSUN", "BALON", "MERAH"] as const;
const WORDS_MEDIUM = ["BANANA", "KELAPA", "SEPEDA", "PAPAYA", "KAKAK", "ANAKAN", "SALSA", "KERETA"] as const;
const WORDS_HARD = ["SEKOLAH", "PELANGI", "KAKAKTUA", "ANANAS", "BATANG", "MANGGA", "KALKULUS", "SAPARATA"] as const;

/** Distinct arrangements of a word's letters: n! divided by k! for every repeated letter. */
export function arrangements(word: string): number {
  const counts = new Map<string, number>();
  for (const letter of word) counts.set(letter, (counts.get(letter) ?? 0) + 1);
  let result = factorial(word.length);
  for (const k of counts.values()) result /= factorial(k);
  return result;
}

export function makeWordArrangementsQuestion(index: number, rand: Rand): DrillQuestion {
  const pool = index >= 12 ? WORDS_HARD : index >= 5 ? WORDS_MEDIUM : WORDS_EASY;
  const usable = pool.filter((w) => arrangements(w) <= 9999);
  const word = pick(rand, usable);
  return { prompt: `Susunan huruf ${word}: …`, separator: "", answer: [arrangements(word)] };
}

/**
 * Stars and bars: whole-number solutions of x₁ + … + xₖ = n are C(n + k − 1, k − 1);
 * with every xᵢ at least 1 they are C(n − 1, k − 1). Also told as sharing sweets.
 */
export function makeStarsBarsQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const k = drillInt(rand, 2, medium ? 4 : 3);
  const n = drillInt(rand, k + 1, hard ? 20 : medium ? 14 : 10);
  const atLeastOne = medium && rand() < 0.5;
  const answer = atLeastOne ? comb(n - 1, k - 1) : comb(n + k - 1, k - 1);
  const vars = ["a", "b", "c", "d"].slice(0, k);
  if (hard && rand() < 0.5) {
    return {
      prompt: `${n} permen dibagi ke ${k} anak${atLeastOne ? ", tiap anak dapat ≥ 1" : ", boleh ada yang tidak dapat"}: … cara`,
      separator: "",
      answer: [answer],
    };
  }
  return { prompt: `${vars.join(" + ")} = ${n}, semua ${atLeastOne ? "≥ 1" : "≥ 0"}: … solusi`, separator: "", answer: [answer] };
}
