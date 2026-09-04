"use client";

import { useActionState } from "react";
import {
  addAvailability,
  deleteAvailability,
  setAvailabilityActive,
  type AvailabilityState,
} from "@/lib/actions/availability";
import { formatMinuteOfDay, WEEKDAY_LABELS } from "@/lib/scheduling";
import { SubmitButton } from "@/components/ui/SubmitButton";

const inputCls =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export type AvailabilityRow = {
  id: string;
  weekday: number;
  startMinute: number;
  durationMinutes: number;
  active: boolean;
};

export function AvailabilityEditor({ windows }: { windows: AvailabilityRow[] }) {
  const [state, formAction] = useActionState<AvailabilityState, FormData>(addAvailability, {});

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-medium text-zinc-900">Weekly availability</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Times you&rsquo;re open to teach. Students can book any open slot in the next four weeks;
        anything already booked disappears from their list automatically. All times are WIB.
      </p>

      {windows.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200">
          {windows.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <span className={`min-w-0 flex-1 text-sm ${w.active ? "text-zinc-900" : "text-zinc-400"}`}>
                <span className="font-medium">{WEEKDAY_LABELS[w.weekday]}</span>{" "}
                {formatMinuteOfDay(w.startMinute)}–
                {formatMinuteOfDay(w.startMinute + w.durationMinutes)}
                <span className="text-zinc-400"> · {w.durationMinutes} min</span>
              </span>
              {!w.active && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">Closed</span>
              )}
              <form action={setAvailabilityActive.bind(null, w.id, !w.active)}>
                <SubmitButton
                  pendingLabel="…"
                  className="text-xs text-zinc-500 hover:text-zinc-800 hover:underline disabled:opacity-50"
                >
                  {w.active ? "Close" : "Reopen"}
                </SubmitButton>
              </form>
              <form action={deleteAvailability.bind(null, w.id)}>
                <SubmitButton
                  pendingLabel="…"
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
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
          <input
            type="number"
            name="durationMinutes"
            defaultValue={60}
            min={15}
            step={15}
            required
            className={`mt-1 block w-24 ${inputCls}`}
          />
        </label>
        <SubmitButton
          pendingLabel="Adding…"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Add window
        </SubmitButton>
      </form>

      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-green-700">{state.success}</p>}
    </section>
  );
}
