"use client";

import { useActionState, useState } from "react";
import { bookSlot, type BookingState } from "@/lib/actions/booking";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useT } from "@/lib/i18n/client";
import { inputCls, labelCls } from "@/components/ui/styles";

export type OpenSlot = {
  availabilityId: string;
  startIso: string;
  durationMinutes: number;
  /** Formatted server-side in the app timezone — see formatSlotDay/Time. */
  dayLabel: string;
  timeLabel: string;
  /** Which tutor's availability this came from — lets a reschedule show only that tutor's times. */
  tutorId?: string;
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

export type BookingSubject = { value: string; label: string; credit: number };

/**
 * The open slots a student can take. What the session is for is picked once,
 * above the times, since it applies to whichever slot they press — and it is
 * what decides how the session is billed.
 */
export function BookingPanel({ slots, subjects = [] }: { slots: OpenSlot[]; subjects?: BookingSubject[] }) {
  const t = useT();
  const [courseId, setCourseId] = useState(subjects.find((s) => s.credit > 0)?.value ?? subjects[0]?.value ?? "");
  const [state, formAction] = useActionState<BookingState, FormData>(bookSlot, {});
  const days = groupByDay(slots);

  return (
    <section>
      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-green-700">{state.success}</p>}

      {subjects.length > 0 && (
        <div className="mt-3 max-w-xs">
          <label className={labelCls} htmlFor="booking-subject">
            {t("schedule.subject")}
          </label>
          <select id="booking-subject" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.credit > 0 ? `${s.label} — ${t("billing.owes", { n: s.credit })}` : s.label}
              </option>
            ))}
            <option value="">{t("schedule.noSubject")}</option>
          </select>
        </div>
      )}

      {days.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{t("booking.noSlots")}</p>
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
                    <input type="hidden" name="courseId" value={courseId} />
                    <SubmitButton
                      pendingLabel={t("sessionRow.booking")}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                    >
                      {slot.timeLabel}
                      <span className="text-zinc-400"> · {t("booking.minutesShort", { n: slot.durationMinutes })}</span>
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
