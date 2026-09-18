import { drillInt, gcd, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Fraction ↔ percent, both directions in one round so neither becomes a reflex:
 * "3/4 = … %" answered in one box, "75% = …" answered as a fraction in two.
 *
 * Only denominators that divide 100 are used, so every percent is a whole
 * number and no answer needs rounding — and the fraction is always already in
 * simplest form, so the percent → fraction direction has one right answer.
 */

/** Denominators of 100, easiest first — a quarter is a friendlier start than a fiftieth. */
const DENOMINATORS = [2, 4, 5, 10, 20, 25, 50];

export function makeFractionPercentQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const pool = DENOMINATORS.slice(0, hard ? 7 : medium ? 5 : 4);

  let denominator: number;
  let numerator: number;
  do {
    denominator = pool[drillInt(rand, 0, pool.length - 1)];
    // A proper fraction keeps the percent under 100, which is what the material uses.
    numerator = drillInt(rand, 1, denominator - 1);
  } while (gcd(numerator, denominator) !== 1);

  const percent = (100 * numerator) / denominator;

  // The other direction joins once there is something to alternate with.
  const askForFraction = medium && rand() < 0.45;
  if (askForFraction) {
    return { prompt: `${percent}% = …`, separator: "/", answer: [numerator, denominator] };
  }
  return { prompt: `${numerator}/${denominator} = … %`, separator: "", answer: [percent] };
}
