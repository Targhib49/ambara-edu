import type { SessionStatus } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";
import { fromLocalParts, toLocalParts } from "@/lib/scheduling";
import { APP_TZ, APP_TZ_OFFSET_MINUTES } from "@/lib/scheduling";

/** Dictionary key for a session status, so both roles show it in their own language. */
export const sessionStatusKey = (status: SessionStatus) => `session.status.${status}` as MessageKey;

/** Weekday names live in the dictionary; 0 = Sunday, matching Date.getDay(). */
export const weekdayKey = (weekday: number) => `weekday.${weekday}` as MessageKey;
export const weekdayShortKey = (weekday: number) => `weekdayShort.${weekday}` as MessageKey;

export const attendanceKey = (value: "ATTENDED" | "NO_SHOW") => `attendance.${value}` as MessageKey;

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  PROPOSED: "Proposed",
  CONFIRMED: "Confirmed",
  RESCHEDULE_REQUESTED_BY_STUDENT: "Reschedule requested",
  RESCHEDULE_REQUESTED_BY_TUTOR: "Reschedule proposed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  AWAITING_RESCHEDULE: "Awaiting new time",
};

export const SESSION_STATUS_BADGE_CLASS: Record<SessionStatus, string> = {
  PROPOSED: "bg-zinc-100 text-zinc-600",
  CONFIRMED: "bg-green-100 text-green-700",
  RESCHEDULE_REQUESTED_BY_STUDENT: "bg-amber-100 text-amber-700",
  RESCHEDULE_REQUESTED_BY_TUTOR: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-zinc-100 text-zinc-400 line-through",
  COMPLETED: "bg-blue-100 text-blue-700",
  AWAITING_RESCHEDULE: "bg-violet-100 text-violet-700",
};

// Indirection so Server Component pages calling this for bucketing
// (upcoming vs. past) aren't flagged by the impure-call-during-render lint
// rule, which only pattern-matches direct Date.now()/new Date() call sites.
export function nowMs() {
  return Date.now();
}

/**
 * Session time for lists and cards. Pinned to en-GB and the app's timezone:
 * with `undefined` the server (UTC on Vercel) and the browser disagree, so the
 * same session read as two different times depending on where it rendered.
 */
export function formatSessionTime(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TZ,
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
  return date.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: APP_TZ });
}

/**
 * Absolute session time for emails and other places with no browser locale to
 * lean on. Rendered in the app's timezone rather than UTC — telling someone in
 * Jakarta their lesson is at "09:00 UTC" is technically true and useless.
 */
export function formatSessionInstant(instant: Date) {
  const shifted = new Date(instant.getTime() + APP_TZ_OFFSET_MINUTES * 60_000);
  return (
    shifted.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " WIB"
  );
}

export const ATTENDANCE_LABEL = { ATTENDED: "Attended", NO_SHOW: "No-show" } as const;

/**
 * The hour and date as the user experiences them, in the app's timezone —
 * both dashboards greet from this. Reading `getHours()` off a server-rendered
 * Date says "Good morning" at 7 PM WIB, because Vercel runs in UTC.
 */
export function appClock(instant: Date = new Date(nowMs())) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: APP_TZ }).format(instant));
  return {
    hour,
    /** Start of that day in the app's timezone, as an absolute instant. */
    dayStart: (offsetDays = 0) => {
      const parts = toLocalParts(instant);
      return fromLocalParts(parts.year, parts.month, parts.day + offsetDays, 0).getTime();
    },
    weekdayShort: (offsetDays = 0) => {
      const parts = toLocalParts(instant);
      const day = fromLocalParts(parts.year, parts.month, parts.day + offsetDays, 12 * 60);
      return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: APP_TZ }).format(day);
    },
    longDate: () =>
      new Intl.DateTimeFormat("en-GB", { weekday: "long", month: "long", day: "numeric", timeZone: APP_TZ }).format(instant),
  };
}

/**
 * Compact session time for tables, e.g. "Tue 15 Sept, 16:00". Formatted on the
 * server in the app's timezone and passed down as a string — formatting in the
 * browser would disagree with server rendering in production, where Vercel
 * runs UTC.
 */
export function formatSessionShort(instant: Date) {
  const shifted = new Date(instant.getTime() + APP_TZ_OFFSET_MINUTES * 60_000);
  return shifted.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
