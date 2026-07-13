"use client";

import { useActionState } from "react";
import { createSession, type CreateSessionState } from "@/lib/actions/sessions";

const inputCls =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export function ScheduleSessionForm({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<CreateSessionState, FormData>(
    createSession,
    {}
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-medium">Schedule a session</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Student</label>
          <select name="studentId" required className={inputCls}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Start time</label>
          <input type="datetime-local" name="startTime" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Duration (min)</label>
          <input
            type="number"
            name="durationMinutes"
            defaultValue={60}
            min={15}
            step={15}
            required
            className={`${inputCls} w-24`}
          />
        </div>
        <button
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {pending ? "Scheduling…" : "Schedule"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
    </form>
  );
}
