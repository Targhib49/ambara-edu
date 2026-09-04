/**
 * Slot arithmetic for availability and repeating bookings.
 *
 * Availability is described as "Tuesdays at 16:00", which only becomes an
 * instant once you fix a timezone. Everyone using this app is in Asia/Jakarta,
 * which is UTC+7 and observes no daylight saving — so a fixed offset is not an
 * approximation here, it is exactly right, and stays right. If the tutor ever
 * moves or takes on students in another zone, this constant becomes a per-user
 * field and these helpers grow a timezone argument; nothing else changes.
 */
export const APP_TZ_OFFSET_MINUTES = 7 * 60;

/** How far ahead students may book. */
export const BOOKING_HORIZON_DAYS = 28;

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type LocalParts = {
  year: number;
  month: number; // 0-indexed
  day: number;
  weekday: number; // 0 = Sunday
  minuteOfDay: number;
};

/** Read an instant as local wall-clock parts. */
export function toLocalParts(instant: Date): LocalParts {
  const shifted = new Date(instant.getTime() + APP_TZ_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    minuteOfDay: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

/** The instant at which local wall-clock time is this date and minute. */
export function fromLocalParts(
  year: number,
  month: number,
  day: number,
  minuteOfDay: number
): Date {
  return new Date(Date.UTC(year, month, day) + (minuteOfDay - APP_TZ_OFFSET_MINUTES) * 60_000);
}

export function formatMinuteOfDay(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseTimeOfDay(value: string): number | null {
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export type AvailabilityWindow = {
  id: string;
  weekday: number;
  startMinute: number;
  durationMinutes: number;
};

export type Busy = { startTime: Date; durationMinutes: number };

export type Slot = {
  /** Availability window this came from — the server re-checks it on booking. */
  availabilityId: string;
  start: Date;
  durationMinutes: number;
};

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Concrete bookable slots over the next `days`, from weekly windows minus
 * anything already booked. Slots in the past are dropped, so "today" only ever
 * offers times still to come.
 */
export function generateSlots(
  windows: AvailabilityWindow[],
  busy: Busy[],
  now: Date,
  days: number = BOOKING_HORIZON_DAYS
): Slot[] {
  const busyRanges = busy.map((b) => ({
    start: b.startTime.getTime(),
    end: b.startTime.getTime() + b.durationMinutes * 60_000,
  }));

  const today = toLocalParts(now);
  const slots: Slot[] = [];

  for (let offset = 0; offset < days; offset++) {
    // Walk local calendar days; Date.UTC normalises month/year rollover.
    const dayCursor = new Date(Date.UTC(today.year, today.month, today.day + offset));
    const weekday = dayCursor.getUTCDay();

    for (const window of windows.filter((w) => w.weekday === weekday)) {
      const start = fromLocalParts(
        dayCursor.getUTCFullYear(),
        dayCursor.getUTCMonth(),
        dayCursor.getUTCDate(),
        window.startMinute
      );
      const end = start.getTime() + window.durationMinutes * 60_000;
      if (start.getTime() <= now.getTime()) continue;
      if (busyRanges.some((r) => overlaps(start.getTime(), end, r.start, r.end))) continue;

      slots.push({
        availabilityId: window.id,
        start,
        durationMinutes: window.durationMinutes,
      });
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Weekly occurrence instants for a repeating booking, starting on or after `startsOn`. */
export function seriesOccurrences(
  weekday: number,
  startMinute: number,
  startsOn: Date,
  occurrences: number
): Date[] {
  const parts = toLocalParts(startsOn);
  // Roll forward to the first matching weekday on or after the start date.
  const firstDay = new Date(Date.UTC(parts.year, parts.month, parts.day));
  const delta = (weekday - firstDay.getUTCDay() + 7) % 7;

  return Array.from({ length: occurrences }, (_, i) => {
    const day = new Date(Date.UTC(parts.year, parts.month, parts.day + delta + i * 7));
    return fromLocalParts(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      startMinute
    );
  });
}

/**
 * Slot labels are formatted on the server in the app's timezone, never with
 * `toLocaleString(undefined)`. Two reasons: the browser and the server disagree
 * about the default timezone in production (Vercel runs UTC), which is a
 * hydration mismatch waiting to happen; and availability is published in WIB,
 * so showing it in WIB is what actually matches what the tutor set.
 */
function shift(instant: Date) {
  return new Date(instant.getTime() + APP_TZ_OFFSET_MINUTES * 60_000);
}

export function formatSlotDay(instant: Date) {
  return shift(instant).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function formatSlotTime(instant: Date) {
  return shift(instant).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
