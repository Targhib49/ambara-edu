/**
 * Shapes for the Intermediate Math content files from Bab 2 on
 * (scripts/content/math-bab<N>.ts and math-bab<N>-chapter.ts), read by
 * scripts/setup-math-bab.ts and scripts/setup-math-chapter.ts.
 * Bab 1 predates these and keeps its own copies. questionRow turns a question
 * into the DB columns, validated by the app's own answer schemas.
 */
import type { QuizStyle } from "../../src/generated/prisma/enums";
import { parseCorrectAnswer } from "../../src/lib/quiz/schema";

export type Letter = "A" | "B" | "C" | "D";

export type Question =
  | { type: "MULTIPLE_CHOICE"; prompt: string; points: number; options: string[]; answer: Letter; explanation: string }
  | { type: "MULTI_SELECT"; prompt: string; points: number; options: string[]; answer: Letter[]; explanation: string }
  | { type: "NUMERIC"; prompt: string; points: number; answer: number; explanation: string }
  /**
   * A fraction answer "a/b", stored as SHORT_TEXT exact. The grader compares
   * numerically, so an equivalent fraction or decimal also counts — ask for a
   * simplest form with MULTIPLE_CHOICE instead.
   */
  | { type: "FRACTION"; prompt: string; points: number; answer: string; explanation: string }
  | { type: "STEPS"; prompt: string; points: number; steps: { prompt: string; answer: string }[]; explanation: string }
  | { type: "MULTI_PART"; prompt: string; points: number; parts: { prompt: string; marks: number; answer: string }[]; explanation: string }
  | { type: "FIND_MISTAKE"; prompt: string; points: number; lines: string[]; wrongIndex: number; correction: string; explanation: string }
  | { type: "CODE"; prompt: string; points: number; tests: { input: string; expectedOutput: string }[]; explanation: string };

export type Block =
  | { type: "MARKDOWN"; markdown: string }
  | { type: "PDF"; dir: string; fileName: string }
  | { type: "CODE_EDITOR"; starterCode: string };

export type Sesi = { title: string; blocks: Block[]; quiz: { title: string; questions: Question[] } };

export type BabContent = {
  chapterTitle: string;
  /** Prefix of the PDFs' file names, e.g. "Bab2-"; a lesson holding one means apply already ran. */
  pdfPrefix: string;
  sesi: Sesi[];
};

export type ChapterQuiz = {
  title: string;
  style: QuizStyle;
  settings?: {
    timeLimitMinutes?: number;
    maxAttempts?: number;
    randomizeQuestionOrder?: boolean;
    drillSkill?: string;
    drillSeconds?: number;
    drillTarget?: number;
    reviewCount?: number;
  };
  questions: Question[];
};

export type ChapterContent = {
  chapterTitle: string;
  quizzes: ChapterQuiz[];
  /** Published chapter-level quizzes that the new sequence replaces; publish archives them. */
  archiveOnPublish: string[];
};

/** The DB type and answer columns for one question. */
export function questionRow(q: Question) {
  switch (q.type) {
    case "MULTIPLE_CHOICE":
      return { type: q.type, options: q.options, correctAnswer: parseCorrectAnswer(q.type, { letter: q.answer }) };
    case "MULTI_SELECT":
      return { type: q.type, options: q.options, correctAnswer: parseCorrectAnswer(q.type, { letters: q.answer }) };
    case "NUMERIC":
      return { type: q.type, options: [], correctAnswer: parseCorrectAnswer(q.type, { value: q.answer, tolerance: 0 }) };
    case "FRACTION":
      if (!/^-?\d+\/\d+$/.test(q.answer)) throw new Error(`fraction answer "${q.answer}" is not a/b`);
      return { type: "SHORT_TEXT" as const, options: [], correctAnswer: parseCorrectAnswer("SHORT_TEXT", { kind: "exact", value: q.answer }) };
    case "STEPS":
      return { type: q.type, options: [], correctAnswer: parseCorrectAnswer(q.type, { steps: q.steps }) };
    case "MULTI_PART":
      return { type: q.type, options: [], correctAnswer: parseCorrectAnswer(q.type, { parts: q.parts }) };
    case "FIND_MISTAKE":
      return { type: q.type, options: [], correctAnswer: parseCorrectAnswer(q.type, { lines: q.lines, wrongIndex: q.wrongIndex, correction: q.correction }) };
    case "CODE":
      return { type: q.type, options: [], correctAnswer: parseCorrectAnswer(q.type, { testCases: q.tests }) };
  }
}
