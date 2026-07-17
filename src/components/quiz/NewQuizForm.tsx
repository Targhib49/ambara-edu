"use client";

import { useActionState } from "react";
import { createQuiz, type CreateQuizState } from "@/lib/actions/quizzes";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export function NewQuizForm({ lessonOptions }: { lessonOptions: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<CreateQuizState, FormData>(createQuiz, {});

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div className="min-w-48 flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-500">Title</label>
        <input name="title" required placeholder="New quiz title" className={inputCls} />
      </div>
      <div className="min-w-48 flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-500">Lesson</label>
        <select name="lessonId" defaultValue="" className={inputCls}>
          <option value="">Standalone (try-out)</option>
          {lessonOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Creating…" : "+ New quiz"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
