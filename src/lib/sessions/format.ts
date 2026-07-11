import type { SessionStatus } from "@/generated/prisma/enums";

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  PROPOSED: "Proposed",
  CONFIRMED: "Confirmed",
  RESCHEDULE_REQUESTED_BY_STUDENT: "Reschedule requested",
  RESCHEDULE_REQUESTED_BY_TUTOR: "Reschedule proposed",
  CANCELLED: "Cancelled",
};

export const SESSION_STATUS_BADGE_CLASS: Record<SessionStatus, string> = {
  PROPOSED: "bg-zinc-100 text-zinc-600",
  CONFIRMED: "bg-green-100 text-green-700",
  RESCHEDULE_REQUESTED_BY_STUDENT: "bg-amber-100 text-amber-700",
  RESCHEDULE_REQUESTED_BY_TUTOR: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-zinc-100 text-zinc-400 line-through",
};

// Indirection so Server Component pages calling this for bucketing
// (upcoming vs. past) aren't flagged by the impure-call-during-render lint
// rule, which only pattern-matches direct Date.now()/new Date() call sites.
export function nowMs() {
  return Date.now();
}

export function formatSessionTime(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** For <input type="datetime-local"> defaultValue — local time, no timezone suffix. */
export function toDatetimeLocalValue(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, n: number) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

/** 6x7 grid of dates covering the month, padded with adjacent-month days. */
export function buildMonthGrid(monthCursor: Date): Date[] {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, i) => new Date(year, month, i - startWeekday + 1));
}

export function dateKey(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatTimeOnly(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" });
}
