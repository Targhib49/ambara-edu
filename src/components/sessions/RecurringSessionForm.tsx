"use client";

import { useActionState } from "react";
import { createSeries, type BookingState } from "@/lib/actions/booking";
import { WEEKDAY_LABELS } from "@/lib/scheduling";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export function RecurringSessionForm({
  students,
  today,
}: {
  students: { id: string; name: string }[];
  today: string;
}) {
  const [state, formAction] = useActionState<BookingState, FormData>(createSeries, {});

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-medium text-zinc-900">Repeating sessions</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Creates each week as its own session, so you can move or cancel a single one later without
        disturbing the rest. Occurrences that clash with an existing booking are skipped.
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-xs text-zinc-500">
          Student
          <select name="studentId" required className={`mt-1 block ${inputCls}`}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          Day
          <select name="weekday" defaultValue="1" className={`mt-1 block ${inputCls}`}>
            {WEEKDAY_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          Starts
          <input type="time" name="startTime" defaultValue="16:00" required className={`mt-1 block ${inputCls}`} />
        </label>
        <label className="text-xs text-zinc-500">
          Minutes
          <input type="number" name="durationMinutes" defaultValue={60} min={15} step={15} required className={`mt-1 block w-24 ${inputCls}`} />
        </label>
        <label className="text-xs text-zinc-500">
          From
          <input type="date" name="startsOn" defaultValue={today} required className={`mt-1 block ${inputCls}`} />
        </label>
        <label className="text-xs text-zinc-500">
          Weeks
          <input type="number" name="occurrences" defaultValue={4} min={2} max={52} required className={`mt-1 block w-20 ${inputCls}`} />
        </label>
        <SubmitButton
          pendingLabel="Creating…"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Create series
        </SubmitButton>
      </form>

      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-green-700">{state.success}</p>}
    </section>
  );
}
