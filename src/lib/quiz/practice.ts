import { gradeQuestion } from "@/lib/quiz/grading";
import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";
import type { QuestionType } from "@/generated/prisma/enums";

type PracticeQuestion = { type: QuestionType; points: number; correctAnswer: unknown };

/**
 * Whether a question can be practised: practice needs an instant right-or-wrong,
 * which a code question can only give when it has test cases to run.
 */
export function isPracticable(question: PracticeQuestion): boolean {
  // A project step only makes sense inside its project, so it never turns up
  // in mastery practice or a mixed review.
  if (question.type === "PROJECT_STEP") return false;
  if (question.type !== "CODE") return true;
  try {
    return parseCorrectAnswer("CODE", question.correctAnswer).testCases.length > 0;
  } catch {
    return false;
  }
}

/**
 * Right or wrong, for practice. The grader leaves every code question pending
 * review (a tutor still reads the code), so for practice code is right when
 * every test passes; anything else is right only when the grader says so —
 * a short-text near miss the grader would send to review counts as not yet.
 */
export function isPracticeCorrect(question: PracticeQuestion, response: unknown): boolean {
  if (question.type === "CODE") {
    try {
      const cases = parseCorrectAnswer("CODE", question.correctAnswer).testCases;
      const results = parseResponse("CODE", response).testResults.slice(0, cases.length);
      return cases.length > 0 && results.length === cases.length && results.every((r) => r.passed);
    } catch {
      return false;
    }
  }
  return gradeQuestion(question, response).correct === true;
}
