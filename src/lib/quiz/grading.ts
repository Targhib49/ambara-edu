import type { QuestionType, SubmissionStatus } from "@/generated/prisma/enums";
import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";

export type QuestionGrade = {
  status: "AUTO_GRADED" | "PENDING_REVIEW";
  correct: boolean | null; // null while pending review
  earnedPoints: number; // 0 while pending review
};

function tryParseResponse<K extends QuestionType>(type: K, response: unknown) {
  try {
    return parseResponse(type, response);
  } catch {
    return null;
  }
}

function safeRegexTest(pattern: string, flags: string, value: string) {
  try {
    return new RegExp(pattern, flags).test(value);
  } catch {
    return false;
  }
}

/**
 * Grades a single question's response. Never throws on a malformed response —
 * an unparseable answer is simply wrong, not review-worthy, except where the
 * spec calls for a pending_review fallback (short_text near-misses, code).
 */
export function gradeQuestion(
  question: { type: QuestionType; points: number; correctAnswer: unknown },
  response: unknown
): QuestionGrade {
  const { type, points } = question;

  switch (type) {
    case "CODE":
      return { status: "PENDING_REVIEW", correct: null, earnedPoints: 0 };

    case "MULTIPLE_CHOICE": {
      const correctAnswer = parseCorrectAnswer(type, question.correctAnswer);
      const parsed = tryParseResponse(type, response);
      const correct = !!parsed && parsed.letter === correctAnswer.letter;
      return { status: "AUTO_GRADED", correct, earnedPoints: correct ? points : 0 };
    }

    case "MULTI_SELECT": {
      const correctAnswer = parseCorrectAnswer(type, question.correctAnswer);
      const parsed = tryParseResponse(type, response);
      if (!parsed) return { status: "AUTO_GRADED", correct: false, earnedPoints: 0 };
      const expected = new Set(correctAnswer.letters);
      const given = new Set(parsed.letters);
      const correct = expected.size === given.size && [...expected].every((l) => given.has(l));
      return { status: "AUTO_GRADED", correct, earnedPoints: correct ? points : 0 };
    }

    case "NUMERIC": {
      const correctAnswer = parseCorrectAnswer(type, question.correctAnswer);
      const parsed = tryParseResponse(type, response);
      if (!parsed) return { status: "AUTO_GRADED", correct: false, earnedPoints: 0 };
      const correct = Math.abs(parsed.value - correctAnswer.value) <= correctAnswer.tolerance;
      return { status: "AUTO_GRADED", correct, earnedPoints: correct ? points : 0 };
    }

    case "SHORT_TEXT": {
      const correctAnswer = parseCorrectAnswer(type, question.correctAnswer);
      const parsed = tryParseResponse(type, response);
      if (!parsed) return { status: "PENDING_REVIEW", correct: null, earnedPoints: 0 };
      const value = parsed.value.trim();
      const matched =
        correctAnswer.kind === "exact"
          ? value.toLowerCase() === correctAnswer.value.trim().toLowerCase()
          : safeRegexTest(correctAnswer.pattern, correctAnswer.flags, value);
      if (matched) return { status: "AUTO_GRADED", correct: true, earnedPoints: points };
      // A clean match auto-grades; anything else goes to pending review
      // rather than being marked wrong outright (spec §4).
      return { status: "PENDING_REVIEW", correct: null, earnedPoints: 0 };
    }
  }
}

/** Aggregates per-question grades into the Submission-level fields. */
export function aggregateSubmission(grades: QuestionGrade[]): {
  autoScore: number;
  status: SubmissionStatus;
} {
  const autoScore = grades.reduce((sum, g) => sum + g.earnedPoints, 0);
  const status: SubmissionStatus = grades.some((g) => g.status === "PENDING_REVIEW")
    ? "PENDING_REVIEW"
    : "AUTO_GRADED";
  return { autoScore, status };
}
