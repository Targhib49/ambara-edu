"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  buildMonthGrid,
  dateKey,
  formatTimeOnly,
  nowMs,
  startOfMonth,
  SESSION_STATUS_BADGE_CLASS,
  SESSION_STATUS_LABEL,
} from "@/lib/sessions/format";
import type { SessionStatus } from "@/generated/prisma/enums";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 3;

type CalendarSession = {
  id: string;
  /** Chip text next to the time — the other party's name (student or tutor). */
  label: string;
  startTime: string;
  status: SessionStatus;
};

export function SessionCalendar({
  sessions,
  onSelectSession,
  legendStatuses = ["CONFIRMED", "RESCHEDULE_REQUESTED_BY_STUDENT", "CANCELLED"],
}: {
  sessions: CalendarSession[];
  onSelectSession: (sessionId: string) => void;
  legendStatuses?: SessionStatus[];
}) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date(nowMs())));

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const s of sessions) {
      const key = dateKey(s.startTime);
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return map;
  }, [sessions]);

  const cells = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const todayKey = useMemo(() => dateKey(new Date(nowMs())), []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">
          {monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMonthCursor(startOfMonth(new Date(nowMs())))}
            className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
          >
            Today
          </button>
          <button
            onClick={() => setMonthCursor((m) => addMonths(m, -1))}
            aria-label="Previous month"
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
          >
            ‹
          </button>
          <button
            onClick={() => setMonthCursor((m) => addMonths(m, 1))}
            aria-label="Next month"
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-zinc-200 bg-zinc-200 text-xs">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="bg-zinc-50 px-2 py-1.5 text-center font-medium text-zinc-500">
            {d}
          </div>
        ))}
        {cells.map((date) => {
          const key = dateKey(date);
          const inMonth = date.getMonth() === monthCursor.getMonth();
          const daySessions = byDay.get(key) ?? [];
          const overflow = daySessions.length - MAX_CHIPS_PER_DAY;
          return (
            <div key={key} className={`min-h-[92px] bg-white p-1.5 ${inMonth ? "" : "bg-zinc-50/60"}`}>
              <p
                className={`mb-1 text-right text-xs ${
                  key === todayKey
                    ? "font-semibold text-blue-600"
                    : inMonth
                      ? "text-zinc-500"
                      : "text-zinc-300"
                }`}
              >
                {date.getDate()}
              </p>
              <div className="space-y-0.5">
                {daySessions.slice(0, MAX_CHIPS_PER_DAY).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    title={`${s.label} · ${formatTimeOnly(s.startTime)}`}
                    className={`block w-full truncate rounded px-1 py-0.5 text-left text-[11px] ${SESSION_STATUS_BADGE_CLASS[s.status]}`}
                  >
                    {formatTimeOnly(s.startTime)} {s.label}
                  </button>
                ))}
                {overflow > 0 && <p className="px-1 text-[11px] text-zinc-400">+{overflow} more</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        {legendStatuses.map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${SESSION_STATUS_BADGE_CLASS[status].split(" ")[0]}`} />
            {SESSION_STATUS_LABEL[status]}
          </span>
        ))}
      </div>
    </div>
  );
}
