"use client";

import { useState, useTransition } from "react";
import { updateQuestion, type UpdateQuestionInput } from "@/lib/actions/quizzes";
import type { QuestionType } from "@/generated/prisma/enums";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-zinc-500";
const smallBtn =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";

const LETTERS = ["A", "B", "C", "D"] as const;

export type QuestionForEdit = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  explanation: string;
  options: string[];
  correctAnswer: unknown;
};

function SaveButton({ pending, saved }: { pending: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
    >
      {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
    </button>
  );
}

/** Shared save plumbing every per-type editor below uses — matches the
 * validate-on-server, flash-"Saved"-for-2s pattern from BlockEditor. */
function useSave(questionId: string) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = (input: UpdateQuestionInput) =>
    startTransition(async () => {
      const result = await updateQuestion(questionId, input);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  return { pending, saved, error, save };
}

function MetaFields({
  prompt,
  setPrompt,
  points,
  setPoints,
  explanation,
  setExplanation,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  points: number;
  setPoints: (v: number) => void;
  explanation: string;
  setExplanation: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className={labelCls}>Question prompt</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Points</label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className={`${inputCls} w-24`}
        />
      </div>
      <div>
        <label className={labelCls}>Explanation (shown to the student after grading)</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className={inputCls}
        />
      </div>
    </>
  );
}

function ChoiceEditor({ question, multi }: { question: QuestionForEdit; multi: boolean }) {
  const initialLetters = multi
    ? ((question.correctAnswer as { letters?: string[] })?.letters ?? [])
    : (() => {
        const letter = (question.correctAnswer as { letter?: string })?.letter;
        return letter ? [letter] : [];
      })();

  const [prompt, setPrompt] = useState(question.prompt);
  const [points, setPoints] = useState(question.points);
  const [explanation, setExplanation] = useState(question.explanation);
  const [options, setOptions] = useState<string[]>(
    question.options.length ? question.options : ["Option A", "Option B"]
  );
  const [correctIdx, setCorrectIdx] = useState<Set<number>>(
    new Set(initialLetters.map((l) => LETTERS.indexOf(l as (typeof LETTERS)[number])).filter((i) => i >= 0))
  );
  const { pending, saved, error, save } = useSave(question.id);

  function toggleCorrect(i: number) {
    setCorrectIdx((prev) => {
      if (!multi) return new Set([i]);
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    setOptions((prev) => (prev.length >= 4 ? prev : [...prev, ""]));
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    setCorrectIdx((prev) => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx === i) continue;
        next.add(idx > i ? idx - 1 : idx);
      }
      return next;
    });
  }

  function handleSubmit() {
    const letters = [...correctIdx].sort((a, b) => a - b).map((i) => LETTERS[i]);
    save({
      prompt,
      points,
      explanation,
      options,
      correctAnswer: multi ? { letters } : { letter: letters[0] },
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-3"
    >
      <MetaFields
        prompt={prompt}
        setPrompt={setPrompt}
        points={points}
        setPoints={setPoints}
        explanation={explanation}
        setExplanation={setExplanation}
      />
      <div>
        <label className={labelCls}>Options — tick the correct one{multi ? "(s)" : ""}</label>
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type={multi ? "checkbox" : "radio"}
                checked={correctIdx.has(i)}
                onChange={() => toggleCorrect(i)}
              />
              <span className="w-5 text-xs text-zinc-400">{LETTERS[i]}.</span>
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                className="text-xs text-red-500 disabled:opacity-30"
                aria-label="Remove option"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {options.length < 4 && (
          <button type="button" onClick={addOption} className={`${smallBtn} mt-1.5`}>
            + Add option
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

function NumericEditor({ question }: { question: QuestionForEdit }) {
  const ca = question.correctAnswer as { value?: number; tolerance?: number };
  const [prompt, setPrompt] = useState(question.prompt);
  const [points, setPoints] = useState(question.points);
  const [explanation, setExplanation] = useState(question.explanation);
  const [value, setValue] = useState(ca.value ?? 0);
  const [tolerance, setTolerance] = useState(ca.tolerance ?? 0);
  const { pending, saved, error, save } = useSave(question.id);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ prompt, points, explanation, options: [], correctAnswer: { value, tolerance } });
      }}
      className="space-y-3"
    >
      <MetaFields
        prompt={prompt}
        setPrompt={setPrompt}
        points={points}
        setPoints={setPoints}
        explanation={explanation}
        setExplanation={setExplanation}
      />
      <div className="flex gap-3">
        <div>
          <label className={labelCls}>Correct value</label>
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className={`${inputCls} w-32`}
          />
        </div>
        <div>
          <label className={labelCls}>Tolerance (±, 0 = exact)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className={`${inputCls} w-32`}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

function ShortTextEditor({ question }: { question: QuestionForEdit }) {
  const ca = question.correctAnswer as {
    kind?: "exact" | "regex";
    value?: string;
    pattern?: string;
    flags?: string;
  };
  const [prompt, setPrompt] = useState(question.prompt);
  const [points, setPoints] = useState(question.points);
  const [explanation, setExplanation] = useState(question.explanation);
  const [kind, setKind] = useState<"exact" | "regex">(ca.kind ?? "exact");
  const [value, setValue] = useState(ca.value ?? "");
  const [pattern, setPattern] = useState(ca.pattern ?? "");
  const [flags, setFlags] = useState(ca.flags ?? "i");
  const { pending, saved, error, save } = useSave(question.id);

  function handleSubmit() {
    const correctAnswer =
      kind === "exact" ? { kind: "exact" as const, value } : { kind: "regex" as const, pattern, flags };
    save({ prompt, points, explanation, options: [], correctAnswer });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-3"
    >
      <MetaFields
        prompt={prompt}
        setPrompt={setPrompt}
        points={points}
        setPoints={setPoints}
        explanation={explanation}
        setExplanation={setExplanation}
      />
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={kind === "exact"} onChange={() => setKind("exact")} />
          Exact match
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={kind === "regex"} onChange={() => setKind("regex")} />
          Regex pattern
        </label>
      </div>
      {kind === "exact" ? (
        <div>
          <label className={labelCls}>Correct answer (case-insensitive, trimmed)</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} />
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>Pattern</label>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className={`${inputCls} font-mono`}
              placeholder={String.raw`^\d+$`}
            />
          </div>
          <div>
            <label className={labelCls}>Flags</label>
            <input value={flags} onChange={(e) => setFlags(e.target.value)} className={`${inputCls} w-16`} />
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

function CodeQuestionEditor({ question }: { question: QuestionForEdit }) {
  const ca = question.correctAnswer as { testCases?: { input: string; expectedOutput: string }[] };
  const [prompt, setPrompt] = useState(question.prompt);
  const [points, setPoints] = useState(question.points);
  const [explanation, setExplanation] = useState(question.explanation);
  const [testCases, setTestCases] = useState(ca.testCases ?? []);
  const { pending, saved, error, save } = useSave(question.id);

  function updateCase(i: number, field: "input" | "expectedOutput", value: string) {
    setTestCases((prev) => prev.map((tc, idx) => (idx === i ? { ...tc, [field]: value } : tc)));
  }

  function addCase() {
    setTestCases((prev) => (prev.length >= 20 ? prev : [...prev, { input: "", expectedOutput: "" }]));
  }

  function removeCase(i: number) {
    setTestCases((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ prompt, points, explanation, options: [], correctAnswer: { testCases } });
      }}
      className="space-y-3"
    >
      <MetaFields
        prompt={prompt}
        setPrompt={setPrompt}
        points={points}
        setPoints={setPoints}
        explanation={explanation}
        setExplanation={setExplanation}
      />
      <div>
        <label className={labelCls}>Test cases (stdin → expected stdout). Empty = manual review only.</label>
        <div className="space-y-2">
          {testCases.map((tc, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={tc.input}
                onChange={(e) => updateCase(i, "input", e.target.value)}
                placeholder="stdin"
                rows={1}
                className={`${inputCls} flex-1 font-mono text-xs`}
              />
              <textarea
                value={tc.expectedOutput}
                onChange={(e) => updateCase(i, "expectedOutput", e.target.value)}
                placeholder="expected output"
                rows={1}
                className={`${inputCls} flex-1 font-mono text-xs`}
              />
              <button
                type="button"
                onClick={() => removeCase(i)}
                className="mt-2 text-xs text-red-500"
                aria-label="Remove test case"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {testCases.length < 20 && (
          <button type="button" onClick={addCase} className={`${smallBtn} mt-1.5`}>
            + Add test case
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

/** Client component: dispatches to the type-specific structured editor. */
export function QuestionEditor({ question }: { question: QuestionForEdit }) {
  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return <ChoiceEditor question={question} multi={false} />;
    case "MULTI_SELECT":
      return <ChoiceEditor question={question} multi={true} />;
    case "NUMERIC":
      return <NumericEditor question={question} />;
    case "SHORT_TEXT":
      return <ShortTextEditor question={question} />;
    case "CODE":
      return <CodeQuestionEditor question={question} />;
    default: {
      const _exhaustive: never = question.type;
      return _exhaustive;
    }
  }
}
