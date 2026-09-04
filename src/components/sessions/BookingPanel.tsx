"use client";

import { useActionState } from "react";
import { bookSlot, type BookingState } from "@/lib/actions/booking";
import { SubmitButton } from "@/components/ui/SubmitButton";

export type OpenSlot = {
  availabilityId: string;
  startIso: string;
  durationMinutes: number;
  /** Formatted server-side in the app timezone — see formatSlotDay/Time. */
  dayLabel: string;
  timeLabel: string;
};

function groupByDay(slots: OpenSlot[]) {
  const groups = new Map<string, OpenSlot[]>();
  for (const slot of slots) {
    const bucket = groups.get(slot.dayLabel);
    if (bucket) bucket.push(slot);
    else groups.set(slot.dayLabel, [slot]);
  }
  return [...groups.entries()];
}

export function BookingPanel({ slots }: { slots: OpenSlot[] }) {
  const [state, formAction] = useActionState<BookingState, FormData>(bookSlot, {});
  const days = groupByDay(slots);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-medium text-zinc-900">Book a session</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Open times over the next four weeks, shown in WIB. Booking one confirms it straight away —
        no waiting for a reply.
      </p>

      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-green-700">{state.success}</p>}

      {days.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No open times right now — your tutor will add more, or you can ask for a specific time.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {days.map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{day}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <form key={slot.startIso} action={formAction}>
                    <input type="hidden" name="availabilityId" value={slot.availabilityId} />
                    <input type="hidden" name="start" value={slot.startIso} />
                    <SubmitButton
                      pendingLabel="Booking…"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                    >
                      {slot.timeLabel}
                      <span className="text-zinc-400"> · {slot.durationMinutes}m</span>
                    </SubmitButton>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
