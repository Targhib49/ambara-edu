import type { QuizStyle } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";

/**
 * Every style a tutor can pick, in picker order. A style is only listed here
 * once its player exists, so nothing offered to a tutor is a dead end.
 */
export const QUIZ_STYLES = ["CLASSIC", "TRYOUT", "EXAM", "MASTERY", "DRILL", "REVIEW"] as const satisfies readonly QuizStyle[];

export const quizStyleKey = (style: QuizStyle) => `quizStyle.${style}` as MessageKey;
export const quizStyleHintKey = (style: QuizStyle) => `quizStyle.${style}.hint` as MessageKey;

/**
 * Whether a style's results count as a grade. Graded styles write a Submission
 * and feed scores, averages and "quizzes due"; every other style is practice —
 * it keeps its own progress, earns a completion mark, and never reaches a
 * grade. Targhib's rule: classic, try-out and (once built) exam are graded,
 * everything else is practice.
 */
export const QUIZ_STYLE_GRADED: Record<QuizStyle, boolean> = {
  CLASSIC: true,
  TRYOUT: true,
  EXAM: true,
  MASTERY: false,
  DRILL: false,
  REVIEW: false,
};

export const GRADED_STYLES = (Object.keys(QUIZ_STYLE_GRADED) as QuizStyle[]).filter((s) => QUIZ_STYLE_GRADED[s]);
export const PRACTICE_STYLES = (Object.keys(QUIZ_STYLE_GRADED) as QuizStyle[]).filter((s) => !QUIZ_STYLE_GRADED[s]);

export const isGradedStyle = (style: QuizStyle) => QUIZ_STYLE_GRADED[style];

/** Chip colours, so a syllabus that mixes styles reads at a glance. */
export const QUIZ_STYLE_CHIP: Record<QuizStyle, string> = {
  CLASSIC: "bg-sky-50 text-sky-700",
  TRYOUT: "bg-violet-100 text-violet-800",
  EXAM: "bg-rose-100 text-rose-800",
  MASTERY: "bg-emerald-50 text-emerald-700",
  DRILL: "bg-amber-50 text-amber-800",
  REVIEW: "bg-teal-50 text-teal-700",
};

/** What a new try-out starts with — the settings every existing try-out uses. */
export const TRYOUT_DEFAULTS = { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true } as const;

/** An exam is a try-out you only get one go at. */
export const EXAM_DEFAULTS = { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: true } as const;

/**
 * Styles that run against the clock, one question at a time, through a frozen
 * attempt — try-outs and exams. They share every screen; only the number of
 * attempts differs.
 */
export const TIMED_STYLES: readonly QuizStyle[] = ["TRYOUT", "EXAM"];
export const isTimedStyle = (style: QuizStyle) => TIMED_STYLES.includes(style);

/** Form input to a style, falling back to classic for anything unrecognised. */
export function parseQuizStyle(raw: unknown): QuizStyle {
  return QUIZ_STYLES.find((style) => style === raw) ?? "CLASSIC";
}
