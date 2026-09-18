import { drillInt, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Operations on integers, the Bab 1 skill: "−7 + 12", "5 − (−3)", "−4 × 6",
 * "−36 ÷ 9". Answers can be negative, which is why this skill is `signed`.
 *
 * Difficulty climbs through the round: adding and subtracting small numbers
 * first, then multiplication, then division. Division is built backwards from
 * the quotient, so it always comes out exact.
 */

/** The minus sign as printed, so "−3" doesn't read as a hyphen. */
const MINUS = "−";

/** A number as the first term: "−7". */
const first = (n: number) => (n < 0 ? `${MINUS}${-n}` : `${n}`);
/** A number after an operator gets brackets when negative: "5 − (−3)". */
const operand = (n: number) => (n < 0 ? `(${MINUS}${-n})` : `${n}`);

/** A non-zero integer in ±max, negative about half the time. */
function signedInt(rand: Rand, max: number): number {
  const n = drillInt(rand, 1, max);
  return rand() < 0.5 ? -n : n;
}

export function makeIntegerQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;

  const ops = hard ? ["+", "-", "×", "÷"] : medium ? ["+", "-", "×"] : ["+", "-"];
  const op = ops[drillInt(rand, 0, ops.length - 1)];

  if (op === "×") {
    const a = signedInt(rand, hard ? 12 : 9);
    const b = signedInt(rand, hard ? 12 : 9);
    return { prompt: `${first(a)} × ${operand(b)}`, separator: "", answer: [a * b] };
  }
  if (op === "÷") {
    const divisor = signedInt(rand, 12);
    const quotient = signedInt(rand, 12);
    return { prompt: `${first(divisor * quotient)} ÷ ${operand(divisor)}`, separator: "", answer: [quotient] };
  }

  const max = hard ? 50 : medium ? 25 : 12;
  const a = signedInt(rand, max);
  const b = signedInt(rand, max);
  if (op === "+") return { prompt: `${first(a)} + ${operand(b)}`, separator: "", answer: [a + b] };
  return { prompt: `${first(a)} ${MINUS} ${operand(b)}`, separator: "", answer: [a - b] };
}
