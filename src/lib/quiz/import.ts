import * as XLSX from "xlsx";
import type { QuestionType } from "@/generated/prisma/enums";
import { correctAnswerSchemas } from "@/lib/quiz/schema";

export type QuestionDraft = {
  rowNumber: number;
  type: QuestionType;
  prompt: string;
  points: number;
  explanation: string;
  options: string[];
  correctAnswer: unknown;
  lessonRef: string; // informational only — the quiz's lesson is chosen in the upload form
};

export type RowError = { rowNumber: number; message: string };

export type ImportResult = {
  drafts: QuestionDraft[];
  errors: RowError[];
};

const TYPE_ALIASES: Record<string, QuestionType> = {
  multiple_choice: "MULTIPLE_CHOICE",
  "multiple choice": "MULTIPLE_CHOICE",
  mc: "MULTIPLE_CHOICE",
  multi_select: "MULTI_SELECT",
  "multi select": "MULTI_SELECT",
  "multi-select": "MULTI_SELECT",
  numeric: "NUMERIC",
  short_text: "SHORT_TEXT",
  "short text": "SHORT_TEXT",
  code: "CODE",
};

const HEADER_ALIASES: Record<string, string> = {
  lesson: "lesson",
  track: "lesson",
  "track/lesson": "lesson",
  "track / lesson": "lesson",
  question_type: "question_type",
  type: "question_type",
  question_text: "question_text",
  question: "question_text",
  prompt: "question_text",
  option_a: "option_a",
  a: "option_a",
  option_b: "option_b",
  b: "option_b",
  option_c: "option_c",
  c: "option_c",
  option_d: "option_d",
  d: "option_d",
  correct_answer: "correct_answer",
  answer: "correct_answer",
  points: "points",
  point: "points",
  explanation: "explanation",
  feedback: "explanation",
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parses an uploaded .csv/.xlsx file into an array of header-keyed row objects. */
export function parseWorkbook(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array", codepage: 65001 });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return raw.map((row) => {
    const normalized: Record<string, string> = {};
    for (const [header, value] of Object.entries(row)) {
      const key = HEADER_ALIASES[normalizeHeader(header)];
      if (key) normalized[key] = String(value ?? "").trim();
    }
    return normalized;
  });
}

function isBlankRow(row: Record<string, string>) {
  return Object.values(row).every((v) => v === "");
}

/** Validates parsed rows into question drafts + a per-row error report. Nothing is committed here. */
export function validateRows(rows: Record<string, string>[]): ImportResult {
  const drafts: QuestionDraft[] = [];
  const errors: RowError[] = [];

  rows.forEach((row, i) => {
    const rowNumber = i + 2; // header is row 1
    if (isBlankRow(row)) return;

    const typeRaw = normalizeHeader(row.question_type ?? "");
    const type = TYPE_ALIASES[typeRaw];
    if (!type) {
      errors.push({
        rowNumber,
        message: `Unknown question_type "${row.question_type ?? ""}" (expected multiple_choice, multi_select, numeric, short_text, or code).`,
      });
      return;
    }

    const prompt = row.question_text ?? "";
    if (!prompt) {
      errors.push({ rowNumber, message: "Missing question_text." });
      return;
    }

    let points = 1;
    if (row.points) {
      const parsedPoints = Number(row.points);
      if (Number.isNaN(parsedPoints) || parsedPoints <= 0) {
        errors.push({ rowNumber, message: `Invalid points value "${row.points}".` });
        return;
      }
      points = parsedPoints;
    }

    const options = (["option_a", "option_b", "option_c", "option_d"] as const)
      .map((key) => row[key] ?? "")
      .filter((v) => v !== "");

    const correctAnswerRaw = (row.correct_answer ?? "").trim();
    let correctAnswer: unknown;

    if (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") {
      if (options.length < 2) {
        errors.push({ rowNumber, message: "Needs at least two non-empty options (option_a, option_b, ...)." });
        return;
      }
      const letters = correctAnswerRaw
        .split(";")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const validLetters = ["A", "B", "C", "D"].slice(0, options.length);
      const invalid = letters.filter((l) => !validLetters.includes(l));
      if (letters.length === 0) {
        errors.push({ rowNumber, message: `Missing correct_answer (expected a letter like "B", or "A;C" for multi_select).` });
        return;
      }
      if (invalid.length > 0) {
        errors.push({ rowNumber, message: `correct_answer references option(s) that don't exist: ${invalid.join(", ")}.` });
        return;
      }
      if (type === "MULTIPLE_CHOICE") {
        if (letters.length !== 1) {
          errors.push({ rowNumber, message: `multiple_choice needs exactly one correct letter, got "${correctAnswerRaw}".` });
          return;
        }
        correctAnswer = { letter: letters[0] };
      } else {
        correctAnswer = { letters };
      }
    } else if (type === "NUMERIC") {
      if (!correctAnswerRaw) {
        errors.push({ rowNumber, message: `Missing correct_answer (expected e.g. "3.14±0.05" or "42").` });
        return;
      }
      const match = correctAnswerRaw.match(/^(-?[\d.]+)\s*±\s*(-?[\d.]+)$/);
      if (match) {
        correctAnswer = { value: Number(match[1]), tolerance: Number(match[2]) };
      } else {
        const bare = Number(correctAnswerRaw);
        if (Number.isNaN(bare)) {
          errors.push({ rowNumber, message: `correct_answer "${correctAnswerRaw}" isn't a number or a "value±tolerance" pair.` });
          return;
        }
        correctAnswer = { value: bare, tolerance: 0 };
      }
    } else if (type === "SHORT_TEXT") {
      if (!correctAnswerRaw) {
        errors.push({ rowNumber, message: "Missing correct_answer." });
        return;
      }
      const regexMatch = correctAnswerRaw.match(/^\/(.+)\/([a-z]*)$/i);
      if (regexMatch) {
        try {
          new RegExp(regexMatch[1], regexMatch[2] || "i");
        } catch {
          errors.push({ rowNumber, message: `correct_answer "${correctAnswerRaw}" isn't a valid regular expression.` });
          return;
        }
        correctAnswer = { kind: "regex", pattern: regexMatch[1], flags: regexMatch[2] || "i" };
      } else {
        correctAnswer = { kind: "exact", value: correctAnswerRaw };
      }
    } else {
      // CODE: correct_answer is an optional JSON array of test cases, e.g.
      // [{"input":"3","expected_output":"6"}]. Blank = no auto-run tests,
      // the question is graded by manual review only.
      if (!correctAnswerRaw) {
        correctAnswer = { testCases: [] };
      } else {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(correctAnswerRaw);
        } catch {
          errors.push({
            rowNumber,
            message: `correct_answer for code must be blank or a JSON array like [{"input":"3","expected_output":"6"}].`,
          });
          return;
        }
        if (!Array.isArray(parsedJson)) {
          errors.push({ rowNumber, message: "correct_answer for code must be a JSON array of test cases." });
          return;
        }
        const testCases = parsedJson.map((tc) => {
          const obj = (tc ?? {}) as Record<string, unknown>;
          return {
            input: String(obj.input ?? ""),
            expectedOutput: String(obj.expected_output ?? obj.expectedOutput ?? ""),
          };
        });
        if (testCases.some((tc) => tc.expectedOutput === "")) {
          errors.push({ rowNumber, message: "Every test case needs a non-empty expected_output." });
          return;
        }
        correctAnswer = { testCases };
      }
    }

    const parsed = correctAnswerSchemas[type].safeParse(correctAnswer);
    if (!parsed.success) {
      errors.push({ rowNumber, message: `Internal validation failed for correct_answer: ${parsed.error.message}` });
      return;
    }

    drafts.push({
      rowNumber,
      type,
      prompt,
      points,
      explanation: row.explanation ?? "",
      options,
      correctAnswer: parsed.data,
      lessonRef: row.lesson ?? "",
    });
  });

  return { drafts, errors };
}
