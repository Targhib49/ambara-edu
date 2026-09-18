"use client";

import { CodeAnswer } from "@/components/quiz/CodeAnswer";
import type { TestCase } from "@/lib/quiz/schema";
import type { QuestionStructure } from "@/lib/quiz/forms";
import { PART_LETTERS } from "@/lib/quiz/format";
import { useT } from "@/lib/i18n/client";
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
  /** Step prompts, parts, or solution lines — the structured types only. */
  structure?: QuestionStructure;
};

const fieldCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

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
  const t = useT();
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

  if (question.type === "STEPS" && question.structure?.kind === "steps") {
    const given = (response as { steps?: string[] } | undefined)?.steps ?? [];
    const steps = question.structure.steps;
    return (
      <ol className="space-y-3">
        {steps.map((stepPrompt, i) => (
          <li key={i} className="flex flex-wrap items-center gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm text-zinc-700">{stepPrompt}</span>
            <input
              value={given[i] ?? ""}
              onChange={(e) =>
                onChange({ steps: steps.map((_, j) => (j === i ? e.target.value : given[j] ?? "")) })
              }
              aria-label={t("answer.stepAnswer", { n: i + 1 })}
              className={`${fieldCls} sm:w-40`}
            />
          </li>
        ))}
      </ol>
    );
  }

  if (question.type === "MULTI_PART" && question.structure?.kind === "parts") {
    const given = (response as { parts?: string[] } | undefined)?.parts ?? [];
    const parts = question.structure.parts;
    return (
      <ol className="space-y-3">
        {parts.map((part, i) => (
          <li key={i} className="flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm font-medium text-zinc-500">({PART_LETTERS[i] ?? i + 1})</span>
            <span className="min-w-0 flex-1 text-sm text-zinc-700">{part.prompt}</span>
            <span className="shrink-0 text-xs text-zinc-400">{t("answer.marks", { n: part.marks })}</span>
            <input
              value={given[i] ?? ""}
              onChange={(e) =>
                onChange({ parts: parts.map((_, j) => (j === i ? e.target.value : given[j] ?? "")) })
              }
              aria-label={t("answer.partAnswer", { part: PART_LETTERS[i] ?? i + 1 })}
              className={`${fieldCls} sm:w-40`}
            />
          </li>
        ))}
      </ol>
    );
  }

  if (question.type === "FIND_MISTAKE" && question.structure?.kind === "lines") {
    const given = response as { lineIndex?: number | null; correction?: string } | undefined;
    const { lines, wantsCorrection } = question.structure;
    const update = (patch: { lineIndex?: number | null; correction?: string }) =>
      onChange({ lineIndex: given?.lineIndex ?? null, correction: given?.correction ?? "", ...patch });
    return (
      <div className="space-y-3">
        <p className="text-xs text-zinc-500">{t("answer.pickWrongLine")}</p>
        <ol className="space-y-1.5">
          {lines.map((line, i) => {
            const picked = given?.lineIndex === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => update({ lineIndex: i })}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left font-mono text-sm transition ${
                    picked ? "border-red-400 bg-red-50 text-red-900" : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <span className="shrink-0 text-xs text-zinc-400">#{i + 1}</span>
                  {line}
                </button>
              </li>
            );
          })}
        </ol>
        {wantsCorrection && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">{t("answer.correction")}</label>
            <input
              value={given?.correction ?? ""}
              onChange={(e) => update({ correction: e.target.value })}
              className={`${fieldCls} max-w-sm`}
            />
          </div>
        )}
      </div>
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
