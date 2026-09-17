import type { QuizStyle } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";

/**
 * Every style a tutor can pick, in picker order. A style is only listed here
 * once its player exists, so nothing offered to a tutor is a dead end.
 */
export const QUIZ_STYLES = ["CLASSIC", "TRYOUT"] as const satisfies readonly QuizStyle[];

export const quizStyleKey = (style: QuizStyle) => `quizStyle.${style}` as MessageKey;
export const quizStyleHintKey = (style: QuizStyle) => `quizStyle.${style}.hint` as MessageKey;

/** Chip colours, so a syllabus that mixes styles reads at a glance. */
export const QUIZ_STYLE_CHIP: Record<QuizStyle, string> = {
  CLASSIC: "bg-sky-50 text-sky-700",
  TRYOUT: "bg-violet-100 text-violet-800",
};

/** What a new try-out starts with — the settings every existing try-out uses. */
export const TRYOUT_DEFAULTS = { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true } as const;

/** Form input to a style, falling back to classic for anything unrecognised. */
export function parseQuizStyle(raw: unknown): QuizStyle {
  return QUIZ_STYLES.find((style) => style === raw) ?? "CLASSIC";
}
