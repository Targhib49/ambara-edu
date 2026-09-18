"use client";

import { useActionState, useState } from "react";
import { createSession, type CreateSessionState } from "@/lib/actions/sessions";
import { createSeries, type BookingState } from "@/lib/actions/booking";
import { WEEKDAY_LABELS } from "@/lib/scheduling";
import { weekdayKey } from "@/lib/sessions/format";
import { useT } from "@/lib/i18n/client";
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
  today,
  defaultStudentId,
}: {
  students: ComboOption[];
  /** YYYY-MM-DD in app time, for the date fields' defaults. */
  today: string;
  defaultStudentId?: string;
}) {
  const t = useT();
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
        <label className={labelCls}>{t("students.header.student")}</label>
        <Combobox
          name="studentId"
          required
          options={students}
          value={studentId}
          onChange={setStudentId}
          placeholder={t("schedule.searchStudent")}
          aria-label={t("students.header.student")}
        />
      </div>

      {(
        <div>
          <span className={labelCls}>{t("schedule.howOften")}</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1">
            {(
              [
                ["once", t("schedule.once")],
                ["weekly", t("schedule.weekly")],
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
              {t("schedule.date")}
            </label>
            <input id="session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="session-time">
              {t("schedule.startsWib")}
            </label>
            <input id="session-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputCls} />
          </div>
          <input type="hidden" name="startTime" value={`${date}T${time}`} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="series-day">
              {t("schedule.day")}
            </label>
            <select id="series-day" name="weekday" defaultValue="1" className={inputCls}>
              {WEEKDAY_LABELS.map((label, i) => (
                <option key={label} value={i}>
                  {t(weekdayKey(i))}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="series-time">
              {t("schedule.startsWib")}
            </label>
            <input id="series-time" type="time" name="startTime" defaultValue="16:00" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="series-from">
              {t("schedule.firstWeek")}
            </label>
            <input id="series-from" type="date" name="startsOn" defaultValue={today} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="series-weeks">
              {t("schedule.numberOfWeeks")}
            </label>
            <input id="series-weeks" type="number" name="occurrences" defaultValue={4} min={2} max={52} required className={inputCls} />
          </div>
          <p className={`${hintCls} col-span-2`}>{t("schedule.seriesHint")}</p>
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="session-length">
          {t("schedule.length")}
        </label>
        <select id="session-length" name="durationMinutes" defaultValue="60" className={inputCls}>
          {DURATIONS.map((m) => (
            <option key={m} value={m}>
              {m < 60
                ? t("schedule.minutesOption", { n: m })
                : m % 60 === 0
                  ? t(m === 60 ? "schedule.hourOption" : "schedule.hoursOption", { n: m / 60 })
                  : t("schedule.hourMinuteOption", { h: Math.floor(m / 60), m: m % 60 })}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? t("schedule.scheduling") : mode === "once" ? t("studentPage.scheduleSession") : t("schedule.createWeekly")}
        </button>
      </div>
    </form>
  );
}
