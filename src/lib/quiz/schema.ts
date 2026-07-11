import { z } from "zod";
import { QuestionType } from "@/generated/prisma/enums";

const LETTER = z.enum(["A", "B", "C", "D"]);

/**
 * correctAnswer shape per question type — validated the same way ContentBlock.data
 * is (see src/lib/blocks/schema.ts). `code` is a placeholder until the runner
 * phase; nothing reads it yet.
 */
export const correctAnswerSchemas = {
  MULTIPLE_CHOICE: z.object({ letter: LETTER }),
  MULTI_SELECT: z.object({ letters: z.array(LETTER).min(1) }),
  NUMERIC: z.object({ value: z.number(), tolerance: z.number().min(0) }),
  SHORT_TEXT: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("exact"), value: z.string().min(1) }),
    z.object({ kind: z.literal("regex"), pattern: z.string().min(1), flags: z.string().default("i") }),
  ]),
  CODE: z.object({}).passthrough(),
} as const satisfies Record<QuestionType, z.ZodType>;

export type CorrectAnswerMap = {
  [K in QuestionType]: z.infer<(typeof correctAnswerSchemas)[K]>;
};

export function parseCorrectAnswer<K extends QuestionType>(type: K, data: unknown): CorrectAnswerMap[K] {
  return correctAnswerSchemas[type].parse(data) as CorrectAnswerMap[K];
}

/** Shape of a student's response per question type. */
export const responseSchemas = {
  MULTIPLE_CHOICE: z.object({ letter: LETTER }),
  MULTI_SELECT: z.object({ letters: z.array(LETTER) }),
  NUMERIC: z.object({ value: z.number() }),
  SHORT_TEXT: z.object({ value: z.string() }),
  CODE: z.object({ code: z.string() }),
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
