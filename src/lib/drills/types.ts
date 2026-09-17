import type { MessageKey } from "@/lib/i18n/messages";

export type Rand = () => number;

/**
 * One generated drill question. Answers are typed into `answer.length` small
 * boxes joined by `separator` ("2 : 3"), so a skill never has to parse free text.
 */
export type DrillQuestion = {
  prompt: string;
  separator: string;
  answer: number[];
};

export type DrillSkillDefinition = {
  labelKey: MessageKey;
  /** What the student is asked to do, shown above the question. */
  instructionKey: MessageKey;
  /**
   * Makes the question at `index` in the round (0 = first), so difficulty can
   * climb as the round goes on. The random source is passed in, keeping the
   * generator pure and callable from event handlers only.
   */
  make: (index: number, rand: Rand) => DrillQuestion;
};

export const drillInt = (rand: Rand, min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
