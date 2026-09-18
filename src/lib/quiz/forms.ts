import { parseCorrectAnswer } from "@/lib/quiz/schema";
import type { QuestionForForm } from "@/components/quiz/QuestionAnswerInput";
import type { QuestionType } from "@/generated/prisma/enums";

/**
 * The parts of a structured question the student needs to see — step prompts,
 * the parts and their marks, the lines of a worked solution. Deliberately
 * answer-free: correct answers never leave the server.
 */
export type QuestionStructure =
  | { kind: "steps"; steps: string[] }
  | { kind: "parts"; parts: { prompt: string; marks: number }[] }
  | { kind: "lines"; lines: string[]; wantsCorrection: boolean };

type QuestionRow = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options: string[];
  correctAnswer: unknown;
};

export function questionStructure(question: QuestionRow): QuestionStructure | undefined {
  try {
    switch (question.type) {
      case "STEPS":
        return { kind: "steps", steps: parseCorrectAnswer("STEPS", question.correctAnswer).steps.map((s) => s.prompt) };
      case "MULTI_PART":
        return {
          kind: "parts",
          parts: parseCorrectAnswer("MULTI_PART", question.correctAnswer).parts.map((p) => ({ prompt: p.prompt, marks: p.marks })),
        };
      case "FIND_MISTAKE": {
        const answer = parseCorrectAnswer("FIND_MISTAKE", question.correctAnswer);
        return { kind: "lines", lines: answer.lines, wantsCorrection: answer.correction.trim() !== "" };
      }
      default:
        return undefined;
    }
  } catch {
    // A question saved by a newer build than this one: the player skips its
    // structure rather than taking the whole page down.
    return undefined;
  }
}

/** One question as the answering forms need it — never carrying its answer. */
export function toQuestionForForm(question: QuestionRow): QuestionForForm {
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    points: question.points,
    options: question.options,
    // Test cases are deliberately visible to the student; only CODE has any.
    testCases: question.type === "CODE" ? parseCorrectAnswer("CODE", question.correctAnswer).testCases : [],
    structure: questionStructure(question),
  };
}
