import { makeRatioQuestion } from "@/lib/drills/ratio";
import { makeFractionPercentQuestion } from "@/lib/drills/fractionPercent";
import { makeIntegerQuestion } from "@/lib/drills/integers";
import {
  makeDivisorCountQuestion,
  makeGcdLcmQuestion,
  makeLastDigitQuestion,
  makePowerRemainderQuestion,
  makeTrailingZerosQuestion,
} from "@/lib/drills/numberTheory";
import { makeLinearEquationQuestion, makeSymmetricSumsQuestion } from "@/lib/drills/olympiadAlgebra";
import { makeCountingQuestion, makeInclusionExclusionQuestion } from "@/lib/drills/counting";
import { makePolygonAnglesQuestion, makePythagorasQuestion } from "@/lib/drills/olympiadGeometry";
import type { DrillQuestion, DrillSkillDefinition } from "@/lib/drills/types";

/**
 * Every drill skill a tutor can pick. Adding one is a generator plus an entry
 * here and its two dictionary keys (and `signed` if an answer can be negative).
 */
export const DRILL_SKILLS = {
  "ratio-simplify": {
    labelKey: "drill.skill.ratioSimplify",
    instructionKey: "drill.instruction.ratioSimplify",
    make: makeRatioQuestion,
  },
  "fraction-percent": {
    labelKey: "drill.skill.fractionPercent",
    instructionKey: "drill.instruction.fractionPercent",
    make: makeFractionPercentQuestion,
  },
  "integer-operations": {
    labelKey: "drill.skill.integerOperations",
    instructionKey: "drill.instruction.integerOperations",
    make: makeIntegerQuestion,
    signed: true,
  },
  // Olympiad course (Persiapan Olimpiade Matematika SMP), one or two per level.
  "gcd-lcm": {
    labelKey: "drill.skill.gcdLcm",
    instructionKey: "drill.instruction.gcdLcm",
    make: makeGcdLcmQuestion,
  },
  "last-digit": {
    labelKey: "drill.skill.lastDigit",
    instructionKey: "drill.instruction.lastDigit",
    make: makeLastDigitQuestion,
  },
  "power-remainder": {
    labelKey: "drill.skill.powerRemainder",
    instructionKey: "drill.instruction.powerRemainder",
    make: makePowerRemainderQuestion,
  },
  "trailing-zeros": {
    labelKey: "drill.skill.trailingZeros",
    instructionKey: "drill.instruction.trailingZeros",
    make: makeTrailingZerosQuestion,
  },
  "divisor-count": {
    labelKey: "drill.skill.divisorCount",
    instructionKey: "drill.instruction.divisorCount",
    make: makeDivisorCountQuestion,
  },
  "linear-equation": {
    labelKey: "drill.skill.linearEquation",
    instructionKey: "drill.instruction.linearEquation",
    make: makeLinearEquationQuestion,
    signed: true,
  },
  "symmetric-sums": {
    labelKey: "drill.skill.symmetricSums",
    instructionKey: "drill.instruction.symmetricSums",
    make: makeSymmetricSumsQuestion,
  },
  "counting": {
    labelKey: "drill.skill.counting",
    instructionKey: "drill.instruction.counting",
    make: makeCountingQuestion,
  },
  "inclusion-exclusion": {
    labelKey: "drill.skill.inclusionExclusion",
    instructionKey: "drill.instruction.inclusionExclusion",
    make: makeInclusionExclusionQuestion,
  },
  "pythagoras": {
    labelKey: "drill.skill.pythagoras",
    instructionKey: "drill.instruction.pythagoras",
    make: makePythagorasQuestion,
  },
  "polygon-angles": {
    labelKey: "drill.skill.polygonAngles",
    instructionKey: "drill.instruction.polygonAngles",
    make: makePolygonAnglesQuestion,
  },
} as const satisfies Record<string, DrillSkillDefinition>;

export type DrillSkill = keyof typeof DRILL_SKILLS;
export const DRILL_SKILL_KEYS = Object.keys(DRILL_SKILLS) as DrillSkill[];

/** What a new drill starts with. */
export const DRILL_DEFAULTS = { drillSkill: "ratio-simplify" as DrillSkill, drillSeconds: 60, drillTarget: 10 } as const;

export const DRILL_SECONDS_MIN = 20;
export const DRILL_SECONDS_MAX = 300;

export function parseDrillSkill(raw: unknown): DrillSkill {
  return DRILL_SKILL_KEYS.find((key) => key === raw) ?? DRILL_DEFAULTS.drillSkill;
}

/** Right when every box holds its number — "4 : 6" is equivalent but not simplest, so it's wrong. */
export function isDrillAnswerCorrect(question: DrillQuestion, given: number[]): boolean {
  return question.answer.length === given.length && question.answer.every((n, i) => n === given[i]);
}
