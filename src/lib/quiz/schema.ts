import { z } from "zod";
import { QuestionType } from "@/generated/prisma/enums";

const LETTER = z.enum(["A", "B", "C", "D"]);

export const testCaseSchema = z.object({
  input: z.string(), // fed to the program as stdin
  expectedOutput: z.string(), // compared against captured stdout
});
export type TestCase = z.infer<typeof testCaseSchema>;

/**
 * correctAnswer shape per question type — validated the same way ContentBlock.data
 * is (see src/lib/blocks/schema.ts). CODE questions imported before the runner
 * phase stored `{}` — the default keeps them parsing as "no test cases"
 * (manual review only).
 */
export const correctAnswerSchemas = {
  MULTIPLE_CHOICE: z.object({ letter: LETTER }),
  MULTI_SELECT: z.object({ letters: z.array(LETTER).min(1) }),
  NUMERIC: z.object({ value: z.number(), tolerance: z.number().min(0) }),
  SHORT_TEXT: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("exact"), value: z.string().min(1) }),
    z.object({ kind: z.literal("regex"), pattern: z.string().min(1), flags: z.string().default("i") }),
  ]),
  CODE: z.object({ testCases: z.array(testCaseSchema).max(20).default([]) }),
} as const satisfies Record<QuestionType, z.ZodType>;

export type CorrectAnswerMap = {
  [K in QuestionType]: z.infer<(typeof correctAnswerSchemas)[K]>;
};

export function parseCorrectAnswer<K extends QuestionType>(type: K, data: unknown): CorrectAnswerMap[K] {
  return correctAnswerSchemas[type].parse(data) as CorrectAnswerMap[K];
}

export const testResultSchema = z.object({
  passed: z.boolean(),
  actualOutput: z.string(),
});
export type TestResult = z.infer<typeof testResultSchema>;

/**
 * Shape of a student's response per question type. CODE test results are
 * produced by the client-side Pyodide runner at submit time (spec §5 v2 —
 * there is no server-side Python, so the tutor review pass is the backstop
 * for anything that looks off). Pre-runner submissions lack the field.
 */
export const responseSchemas = {
  MULTIPLE_CHOICE: z.object({ letter: LETTER }),
  MULTI_SELECT: z.object({ letters: z.array(LETTER) }),
  NUMERIC: z.object({ value: z.number() }),
  SHORT_TEXT: z.object({ value: z.string() }),
  CODE: z.object({ code: z.string(), testResults: z.array(testResultSchema).default([]) }),
} as const satisfies Record<QuestionType, z.ZodType>;

export type ResponseMap = {
  [K in QuestionType]: z.infer<(typeof responseSchemas)[K]>;
};

export function parseResponse<K extends QuestionType>(type: K, data: unknown): ResponseMap[K] {
  return responseSchemas[type].parse(data) as ResponseMap[K];
}

export const submissionAnswerSchema = z.object({
  questionId: z.string(),
  response: z.unknown(),
});
export const submissionAnswersSchema = z.array(submissionAnswerSchema);
export type SubmissionAnswer = z.infer<typeof submissionAnswerSchema>;
