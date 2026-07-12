import type { QuestionType, SubmissionStatus } from "@/generated/prisma/enums";
import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";

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

function optionText(letter: string, options: string[]) {
  const idx = "ABCD".indexOf(letter);
  return options[idx] ? `${letter}. ${options[idx]}` : letter;
}

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

export function formatResponse(type: QuestionType, response: unknown, options: string[]): string {
  switch (type) {
    case "MULTIPLE_CHOICE": {
      const r = safeParse(type, response);
      return r ? optionText(r.letter, options) : "(no answer)";
    }
    case "MULTI_SELECT": {
      const r = safeParse(type, response);
      return r && r.letters.length > 0 ? r.letters.map((l) => optionText(l, options)).join(", ") : "(no answer)";
    }
    case "NUMERIC": {
      const r = safeParse(type, response);
      return r ? String(r.value) : "(no answer)";
    }
    case "SHORT_TEXT": {
      const r = safeParse(type, response);
      return r && r.value ? r.value : "(no answer)";
    }
    case "CODE": {
      const r = safeParse(type, response);
      return r && r.code ? r.code : "(no answer)";
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
