import { drillInt, gcd, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Simplifying ratios, the Bab 3 skill: "12 : 18" → "2 : 3". Built backwards
 * from an answer already in simplest form, scaled up by a common factor, so
 * every question has exactly one right answer.
 *
 * Difficulty climbs through the round: small numbers first, then larger ones,
 * then three-part ratios like the try-out's 48 : 36 : 84.
 */
export function makeRatioQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;

  if (hard && rand() < 0.35) {
    let parts: number[];
    do {
      parts = [drillInt(rand, 1, 9), drillInt(rand, 1, 9), drillInt(rand, 1, 9)];
    } while (gcd(gcd(parts[0], parts[1]), parts[2]) !== 1 || new Set(parts).size < 2);
    const factor = drillInt(rand, 2, 9);
    return { prompt: parts.map((p) => p * factor).join(" : "), separator: ":", answer: parts };
  }

  const maxTerm = medium ? 10 : 6;
  const maxFactor = hard ? 15 : medium ? 12 : 6;
  let a: number;
  let b: number;
  do {
    a = drillInt(rand, 1, maxTerm);
    b = drillInt(rand, 1, maxTerm);
  } while (a === b || gcd(a, b) !== 1);
  const factor = drillInt(rand, 2, maxFactor);
  return { prompt: `${a * factor} : ${b * factor}`, separator: ":", answer: [a, b] };
}
