"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAnswers } from "@/lib/actions/quizzes";
import type { QuestionType } from "@/generated/prisma/enums";

type QuestionForForm = {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options: string[];
};

const LETTERS = ["A", "B", "C", "D"] as const;

export function QuizTakeForm({ quizId, questions }: { quizId: string; questions: QuestionForForm[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  function setResponse(questionId: string, response: unknown) {
    setResponses((prev) => ({ ...prev, [questionId]: response }));
  }

  function toggleMultiSelect(questionId: string, letter: string) {
    setResponses((prev) => {
      const current = (prev[questionId] as { letters?: string[] } | undefined)?.letters ?? [];
      const letters = current.includes(letter) ? current.filter((l) => l !== letter) : [...current, letter];
      return { ...prev, [questionId]: { letters } };
    });
  }

  function handleSubmit() {
    const answers = questions
      .filter((q) => responses[q.id] !== undefined)
      .map((q) => ({ questionId: q.id, response: responses[q.id] }));
    startTransition(async () => {
      await submitQuizAnswers(quizId, answers);
      router.push(`/quizzes/${quizId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Q{i + 1} · {q.points} pt{q.points === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900">{q.prompt}</p>

          <div className="mt-3 space-y-2">
            {q.type === "MULTIPLE_CHOICE" &&
              q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={(responses[q.id] as { letter?: string } | undefined)?.letter === LETTERS[oi]}
                    onChange={() => setResponse(q.id, { letter: LETTERS[oi] })}
                  />
                  {LETTERS[oi]}. {opt}
                </label>
              ))}

            {q.type === "MULTI_SELECT" &&
              q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      ((responses[q.id] as { letters?: string[] } | undefined)?.letters ?? []).includes(LETTERS[oi])
                    }
                    onChange={() => toggleMultiSelect(q.id, LETTERS[oi])}
                  />
                  {LETTERS[oi]}. {opt}
                </label>
              ))}

            {q.type === "NUMERIC" && (
              <input
                type="number"
                step="any"
                onChange={(e) => setResponse(q.id, { value: Number(e.target.value) })}
                className="w-40 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}

            {q.type === "SHORT_TEXT" && (
              <input
                type="text"
                onChange={(e) => setResponse(q.id, { value: e.target.value })}
                className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}

            {q.type === "CODE" && (
              <textarea
                rows={5}
                onChange={(e) => setResponse(q.id, { code: e.target.value })}
                spellCheck={false}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit quiz"}
      </button>
    </div>
  );
}
