"use client";

import { CodeAnswer } from "@/components/quiz/CodeAnswer";
import type { TestCase } from "@/lib/quiz/schema";
import type { QuestionType } from "@/generated/prisma/enums";

export type QuestionForForm = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options: string[];
  testCases: TestCase[]; // CODE questions only, [] otherwise
  /**
   * Display order for choice options, as indexes into `options`. The student
   * sees fresh A–D labels in this order, but the answer still records the
   * authored letter — so grading, stored answers and the tutor's review never
   * need to know a shuffle happened. Omitted means authored order.
   */
  optionOrder?: number[];
};

const LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Renders the answer control for one question, fully controlled by
 * `response`/`onChange` — used both by the untimed all-on-one-page form and
 * the timed one-question-at-a-time form, so a question that mounts/unmounts
 * as the student navigates never loses what they already typed.
 */
export function QuestionAnswerInput({
  question,
  response,
  onChange,
}: {
  question: QuestionForForm;
  response: unknown;
  onChange: (response: unknown) => void;
}) {
  const order = question.optionOrder ?? question.options.map((_, i) => i);

  if (question.type === "MULTIPLE_CHOICE") {
    return (
      <div className="space-y-2">
        {order.map((original, position) => {
          const opt = question.options[original];
          const selected = (response as { letter?: string } | undefined)?.letter === LETTERS[original];
          return (
            <button
              key={original}
              type="button"
              onClick={() => onChange({ letter: LETTERS[original] })}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                  selected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-400"
                }`}
              >
                {selected ? "✓" : LETTERS[position]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "MULTI_SELECT") {
    const selectedLetters = (response as { letters?: string[] } | undefined)?.letters ?? [];
    function toggle(letter: string) {
      const letters = selectedLetters.includes(letter)
        ? selectedLetters.filter((l) => l !== letter)
        : [...selectedLetters, letter];
      onChange({ letters });
    }
    return (
      <div className="space-y-2">
        {order.map((original, position) => {
          const opt = question.options[original];
          const selected = selectedLetters.includes(LETTERS[original]);
          return (
            <button
              key={original}
              type="button"
              onClick={() => toggle(LETTERS[original])}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-medium ${
                  selected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-400"
                }`}
              >
                {selected ? "✓" : LETTERS[position]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "NUMERIC") {
    const value = (response as { value?: number } | undefined)?.value;
    return (
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange({ value: Number(e.target.value) })}
        className="w-40 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    );
  }

  if (question.type === "SHORT_TEXT") {
    const value = (response as { value?: string } | undefined)?.value ?? "";
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange({ value: e.target.value })}
        className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    );
  }

  // CODE
  const initialCode = (response as { code?: string } | undefined)?.code;
  return (
    <CodeAnswer
      testCases={question.testCases}
      initialCode={initialCode}
      onCodeChange={(code) => onChange({ code })}
    />
  );
}
