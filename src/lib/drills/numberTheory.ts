import { drillInt, gcd, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Number-theory drills for the olympiad course's Teori Bilangan levels:
 * FPB/KPK, last digits of powers, remainders of powers, trailing zeros of n!
 * and the number of divisors. Every answer is a small whole number, and each
 * question is built so it has exactly one.
 */

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
/** 2026 → "²⁰²⁶", for a prompt that is plain text. */
export const sup = (n: number) => [...String(n)].map((d) => SUPERSCRIPT[Number(d)]).join("");

const pick = <T,>(rand: Rand, items: readonly T[]): T => items[drillInt(rand, 0, items.length - 1)];

/** a^k mod m without overflow. */
export function powMod(a: number, k: number, m: number): number {
  let result = 1 % m;
  let base = a % m;
  let e = k;
  while (e > 0) {
    if (e % 2 === 1) result = (result * base) % m;
    base = (base * base) % m;
    e = Math.floor(e / 2);
  }
  return result;
}

/** "FPB(84, 120)" or "KPK(12, 18)", built from the FPB so the numbers stay friendly. */
export function makeGcdLcmQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const maxCofactor = hard ? 12 : medium ? 9 : 6;
  let m: number;
  let n: number;
  do {
    m = drillInt(rand, 1, maxCofactor);
    n = drillInt(rand, 2, maxCofactor);
  } while (m === n || gcd(m, n) !== 1);
  const g = drillInt(rand, 2, hard ? 15 : medium ? 12 : 8);
  const [a, b] = m < n ? [g * m, g * n] : [g * n, g * m];
  // KPK joins once FPB is warm, and stays under the four-digit box.
  if (medium && rand() < 0.5 && g * m * n <= 9999) return { prompt: `KPK(${a}, ${b})`, separator: "", answer: [g * m * n] };
  return { prompt: `FPB(${a}, ${b})`, separator: "", answer: [g] };
}

/** "Angka satuan 7⁴³": the cycle of last digits, with exponents growing to 2026. */
export function makeLastDigitQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const base = hard && rand() < 0.4 ? drillInt(rand, 11, 29) : drillInt(rand, 2, 9);
  const exponent = hard ? drillInt(rand, 100, 2026) : medium ? drillInt(rand, 10, 99) : drillInt(rand, 2, 12);
  return { prompt: `Angka satuan ${base}${sup(exponent)}`, separator: "", answer: [powMod(base, exponent, 10)] };
}

/** "Sisa 2¹⁰⁰ ÷ 7": small moduli first, then primes where Fermat does the work. */
export function makePowerRemainderQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const modulus = pick(rand, hard ? [7, 11, 13] : medium ? [5, 7, 9] : [3, 4, 5]);
  let base: number;
  do {
    base = drillInt(rand, 2, hard ? 12 : 9);
  } while (base % modulus === 0);
  const exponent = hard ? drillInt(rand, 50, 2026) : medium ? drillInt(rand, 10, 100) : drillInt(rand, 2, 20);
  return { prompt: `Sisa ${base}${sup(exponent)} ÷ ${modulus}`, separator: "", answer: [powMod(base, exponent, modulus)] };
}

/** "Banyak angka 0 di akhir 137!": counting factors of 5. */
export function makeTrailingZerosQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const n = hard ? drillInt(rand, 200, 2026) : medium ? drillInt(rand, 50, 200) : drillInt(rand, 10, 49);
  let zeros = 0;
  for (let p = 5; p <= n; p *= 5) zeros += Math.floor(n / p);
  return { prompt: `Banyak angka 0 di akhir ${n}!`, separator: "", answer: [zeros] };
}

/** "Banyak faktor 72", or for the hard end straight from a factorisation "2⁴ · 3² · 5". */
export function makeDivisorCountQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const primes = [2, 3, 5, 7];
  const count = hard ? drillInt(rand, 2, 3) : medium ? drillInt(rand, 2, 3) : 2;
  const chosen = primes.slice(0, 4).sort(() => rand() - 0.5).slice(0, count).sort((a, b) => a - b);
  let exponents: number[];
  let n: number;
  do {
    exponents = chosen.map(() => drillInt(rand, 1, hard ? 6 : 3));
    n = chosen.reduce((acc, p, i) => acc * p ** exponents[i], 1);
  } while (!hard && n > (medium ? 1000 : 200));
  const answer = exponents.reduce((acc, e) => acc * (e + 1), 1);
  const prompt = hard
    ? `Banyak faktor ${chosen.map((p, i) => (exponents[i] === 1 ? `${p}` : `${p}${sup(exponents[i])}`)).join(" · ")}`
    : `Banyak faktor ${n}`;
  return { prompt, separator: "", answer: [answer] };
}
