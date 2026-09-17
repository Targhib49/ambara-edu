import type { QuestionType, SubmissionStatus } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";
import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";

/** Dictionary key for a submission status. */
export const submissionStatusKey = (status: SubmissionStatus) => `submission.${status}` as MessageKey;

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  AUTO_GRADED: "Auto-graded",
  PENDING_REVIEW: "Pending review",
  REVIEWED: "Reviewed",
};

export const SUBMISSION_STATUS_BADGE_CLASS: Record<SubmissionStatus, string> = {
  AUTO_GRADED: "bg-green-100 text-green-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-blue-100 text-blue-700",
};

function optionText(letter: string, options: string[], withLetter = true) {
  const idx = "ABCD".indexOf(letter);
  if (!options[idx]) return letter;
  return withLetter ? `${letter}. ${options[idx]}` : options[idx];
}

export type FormatResponseOptions = {
  /**
   * Prefix choices with their authored letter. Turn it off where the student
   * saw the options shuffled — the letter they saw isn't the authored one, so
   * showing it would point at the wrong option.
   */
  letters?: boolean;
  /** What to show for an unanswered question, in the reader's language. */
  noAnswer?: string;
};

export function formatCorrectAnswer(type: QuestionType, correctAnswer: unknown, options: string[]): string {
  switch (type) {
    case "MULTIPLE_CHOICE": {
      const a = parseCorrectAnswer(type, correctAnswer);
      return optionText(a.letter, options);
    }
    case "MULTI_SELECT": {
      const a = parseCorrectAnswer(type, correctAnswer);
      return a.letters.map((l) => optionText(l, options)).join(", ");
    }
    case "NUMERIC": {
      const a = parseCorrectAnswer(type, correctAnswer);
      return a.tolerance > 0 ? `${a.value} ± ${a.tolerance}` : `${a.value}`;
    }
    case "SHORT_TEXT": {
      const a = parseCorrectAnswer(type, correctAnswer);
      return a.kind === "exact" ? a.value : `/${a.pattern}/${a.flags}`;
    }
    case "CODE": {
      const a = parseCorrectAnswer(type, correctAnswer);
      return a.testCases.length > 0
        ? `${a.testCases.length} test case${a.testCases.length === 1 ? "" : "s"} + manual review`
        : "(reviewed manually)";
    }
  }
}

export function formatResponse(
  type: QuestionType,
  response: unknown,
  options: string[],
  { letters = true, noAnswer = "(no answer)" }: FormatResponseOptions = {}
): string {
  switch (type) {
    case "MULTIPLE_CHOICE": {
      const r = safeParse(type, response);
      return r ? optionText(r.letter, options, letters) : noAnswer;
    }
    case "MULTI_SELECT": {
      const r = safeParse(type, response);
      return r && r.letters.length > 0 ? r.letters.map((l) => optionText(l, options, letters)).join(", ") : noAnswer;
    }
    case "NUMERIC": {
      const r = safeParse(type, response);
      return r ? String(r.value) : noAnswer;
    }
    case "SHORT_TEXT": {
      const r = safeParse(type, response);
      return r && r.value ? r.value : noAnswer;
    }
    case "CODE": {
      const r = safeParse(type, response);
      return r && r.code ? r.code : noAnswer;
    }
  }
}

function safeParse<K extends QuestionType>(type: K, response: unknown) {
  try {
    return parseResponse(type, response);
  } catch {
    return null;
  }
}
