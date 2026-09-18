import { makeRatioQuestion } from "@/lib/drills/ratio";
import { makeFractionPercentQuestion } from "@/lib/drills/fractionPercent";
import { makeIntegerQuestion } from "@/lib/drills/integers";
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
