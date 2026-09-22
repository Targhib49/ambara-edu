import { APP_TZ, fromLocalParts, toLocalParts } from "@/lib/scheduling";
import { localeFor, type Language } from "@/lib/i18n/messages";
import { nowMs } from "@/lib/sessions/format";

/**
 * A billing period is a calendar month in the app's timezone. The dates are
 * stored in DATE columns, so they carry no time of day and never shift by a
 * timezone; the instants that bound a month's sessions are worked out from
 * the same month in Asia/Jakarta.
 */
export type Period = { start: Date; end: Date };

/** "2026-09" as the tutor picks it in a month input. */
export function parseMonth(value: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  return month >= 1 && month <= 12 && year >= 2000 && year <= 2100 ? { year, month } : null;
}

/** The current month in app time, as a "2026-09" value. */
export function currentMonth(): string {
  const parts = toLocalParts(new Date(nowMs()));
  return `${parts.year}-${String(parts.month + 1).padStart(2, "0")}`;
}

/** A month's first and last day, as plain dates for the DATE columns. */
export function monthDates(year: number, month: number): Period {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start, end };
}

/** The instants a month covers in app time: [from, before). */
export function monthInstants(year: number, month: number): { from: Date; before: Date } {
  return {
    from: fromLocalParts(year, month - 1, 1, 0),
    before: fromLocalParts(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1, 0),
  };
}

/** "September 2026" for a period's start date, which is a plain date in UTC. */
export function monthLabel(date: Date, language: Language = "ID"): string {
  return new Intl.DateTimeFormat(localeFor(language), { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/** A plain date — an invoice's due date, a payment's day — without a time. */
export function dateLabel(date: Date, language: Language = "ID"): string {
  return new Intl.DateTimeFormat(localeFor(language), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

/** A session's day and time, in app time, for an invoice line. */
export function sessionLineLabel(instant: Date, language: Language = "ID"): string {
  return new Intl.DateTimeFormat(localeFor(language), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TZ,
  }).format(instant);
}

/** "2026-09-30" from a date input, as a plain date. */
export function parseDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Today in app time, as a plain date — the default for a payment's day. */
export function todayDate(): Date {
  const parts = toLocalParts(new Date(nowMs()));
  return new Date(Date.UTC(parts.year, parts.month, parts.day));
}

/** A plain date as "2026-09-30", for a date input's value. */
export function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}
