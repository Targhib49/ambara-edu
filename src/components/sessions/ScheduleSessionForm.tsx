"use client";

import { useActionState, useState } from "react";
import { createSession, type CreateSessionState } from "@/lib/actions/sessions";
import { createSeries, type BookingState } from "@/lib/actions/booking";
import { WEEKDAY_LABELS } from "@/lib/scheduling";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";

const DURATIONS = [30, 45, 60, 90, 120];

/**
 * Lives in the "Schedule session" panel. One form for both a single session and
 * a weekly series, with the student picked by searching rather than scrolling.
 */
export function ScheduleSessionForm({
  students,
  allowWeekly,
  today,
  defaultStudentId,
}: {
  students: ComboOption[];
  allowWeekly: boolean;
  /** YYYY-MM-DD in app time, for the date fields' defaults. */
  today: string;
  defaultStudentId?: string;
}) {
  const panel = useSlideOver();
  const [mode, setMode] = useState<"once" | "weekly">("once");
  const [studentId, setStudentId] = useState(defaultStudentId ?? "");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("16:00");

  // Close the panel once it worked — the new session showing up in the
  // calendar behind it is the confirmation.
  const [onceState, onceAction, oncePending] = useActionState<CreateSessionState, FormData>(async (prev, formData) => {
    const result = await createSession(prev, formData);
    if (result.success) panel?.close();
    return result;
  }, {});
  const [seriesState, seriesAction, seriesPending] = useActionState<BookingState, FormData>(async (prev, formData) => {
    const result = await createSeries(prev, formData);
    if (result.success) panel?.close();
    return result;
  }, {});

  const error = mode === "once" ? onceState.error : seriesState.error;
  const pending = mode === "once" ? oncePending : seriesPending;

  return (
    <form action={mode === "once" ? onceAction : seriesAction} className="space-y-5">
      <div>
        <label className={labelCls}>Student</label>
        <Combobox
          name="studentId"
          required
          options={students}
          value={studentId}
          onChange={setStudentId}
          placeholder="Search by name or email"
          aria-label="Student"
        />
      </div>

      {allowWeekly && (
        <div>
          <span className={labelCls}>How often</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1">
            {(
              [
                ["once", "One session"],
                ["weekly", "Every week"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`rounded-md py-1.5 text-sm font-medium ${
                  mode === value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "once" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="session-date">
              Date
            </label>
            <input id="session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="session-time">
              Starts (WIB)
            </label>
            <input id="session-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputCls} />
          </div>
          <input type="hidden" name="startTime" value={`${date}T${time}`} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="series-day">
              Day
            </label>
            <select id="series-day" name="weekday" defaultValue="1" className={inputCls}>
              {WEEKDAY_LABELS.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="series-time">
              Starts (WIB)
            </label>
            <input id="series-time" type="time" name="startTime" defaultValue="16:00" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="series-from">
              First week
            </label>
            <input id="series-from" type="date" name="startsOn" defaultValue={today} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="series-weeks">
              Number of weeks
            </label>
            <input id="series-weeks" type="number" name="occurrences" defaultValue={4} min={2} max={52} required className={inputCls} />
          </div>
          <p className={`${hintCls} col-span-2`}>
            Each week becomes its own session, so you can move or cancel one without touching the rest. Weeks that clash
            with an existing booking are skipped.
          </p>
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="session-length">
          Length
        </label>
        <select id="session-length" name="durationMinutes" defaultValue="60" className={inputCls}>
          {DURATIONS.map((m) => (
            <option key={m} value={m}>
              {m < 60 ? `${m} minutes` : m % 60 === 0 ? `${m / 60} hour${m === 60 ? "" : "s"}` : `${Math.floor(m / 60)}h ${m % 60}m`}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            Cancel
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? "Scheduling…" : mode === "once" ? "Schedule session" : "Create weekly sessions"}
        </button>
      </div>
    </form>
  );
}
