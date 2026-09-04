"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStudent, requireTutor, requireUser } from "@/lib/auth";
import { sendSessionEmail } from "@/lib/email";
import { formatSessionInstant } from "@/lib/sessions/format";
import { BOOKING_HORIZON_DAYS, generateSlots, parseTimeOfDay, seriesOccurrences } from "@/lib/scheduling";

export type BookingState = { error?: string; success?: string };

function revalidateScheduling() {
  revalidatePath("/tutor/sessions");
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
}

/**
 * Book one open slot. The posted time is never trusted: the slot list is
 * regenerated server-side from the tutor's live availability and bookings, and
 * the request only succeeds if the requested start is still in it. That closes
 * both a stale page (someone else booked it a moment ago) and a hand-crafted
 * request for a time the tutor never offered.
 */
export async function bookSlot(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const student = await requireStudent();
  const availabilityId = String(formData.get("availabilityId") ?? "");
  const startIso = String(formData.get("start") ?? "");
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return { error: "That time is no longer valid." };

  const window = await db.availability.findFirst({
    where: { id: availabilityId, active: true },
    include: { tutor: true },
  });
  if (!window) return { error: "That slot is no longer offered." };

  const busy = await db.session.findMany({
    where: { tutorId: window.tutorId, status: { not: "CANCELLED" } },
    select: { startTime: true, durationMinutes: true },
  });
  const open = generateSlots(
    [window],
    busy,
    new Date(),
    BOOKING_HORIZON_DAYS
  ).some((s) => s.start.getTime() === start.getTime());
  if (!open) return { error: "Someone just booked that time — pick another." };

  await db.session.create({
    data: {
      studentId: student.id,
      tutorId: window.tutorId,
      startTime: start,
      durationMinutes: window.durationMinutes,
      status: "CONFIRMED",
    },
  });

  await sendSessionEmail({
    to: window.tutor.email,
    subject: "A session was booked",
    heading: "New booking",
    body: `${student.name} booked the ${formatSessionInstant(start)} slot (${window.durationMinutes} minutes).`,
  });
  await sendSessionEmail({
    to: student.email,
    subject: "Your session is booked",
    heading: "Session confirmed",
    body: `You're booked with ${window.tutor.name} for ${formatSessionInstant(start)} (${window.durationMinutes} minutes).`,
  });

  revalidateScheduling();
  return { success: `Booked for ${formatSessionInstant(start)} ✓` };
}

/**
 * Create a repeating booking. Occurrences are written as ordinary sessions up
 * front, so each one can later be moved or cancelled on its own without the
 * series needing to model exceptions. Occurrences that would double-book are
 * skipped and reported rather than silently dropped.
 */
export async function createSeries(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const tutor = await requireTutor();

  const studentId = String(formData.get("studentId") ?? "");
  const weekday = Number(formData.get("weekday"));
  const startMinute = parseTimeOfDay(String(formData.get("startTime") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const occurrences = Number(formData.get("occurrences") ?? 4);
  const startsOn = new Date(String(formData.get("startsOn") ?? ""));

  if (!studentId) return { error: "Pick a student." };
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return { error: "Pick a day." };
  if (startMinute === null) return { error: "Enter a start time as HH:MM." };
  if (!durationMinutes || durationMinutes < 15) return { error: "Sessions need to be at least 15 minutes." };
  if (!Number.isInteger(occurrences) || occurrences < 2 || occurrences > 52) {
    return { error: "Repeat between 2 and 52 times." };
  }
  if (Number.isNaN(startsOn.getTime())) return { error: "Pick a start date." };

  const student = await db.user.findUnique({ where: { id: studentId } });
  if (!student) return { error: "That student no longer exists." };

  const instants = seriesOccurrences(weekday, startMinute, startsOn, occurrences);
  const busy = await db.session.findMany({
    where: { tutorId: tutor.id, status: { not: "CANCELLED" } },
    select: { startTime: true, durationMinutes: true },
  });
  const clashes = (start: Date) =>
    busy.some((b) => {
      const bStart = b.startTime.getTime();
      const bEnd = bStart + b.durationMinutes * 60_000;
      const end = start.getTime() + durationMinutes * 60_000;
      return start.getTime() < bEnd && bStart < end;
    });

  const free = instants.filter((d) => !clashes(d));
  if (free.length === 0) return { error: "Every occurrence clashes with an existing session." };

  const series = await db.sessionSeries.create({
    data: { tutorId: tutor.id, studentId, weekday, startMinute, durationMinutes, occurrences, startsOn },
  });
  await db.session.createMany({
    data: free.map((startTime) => ({
      studentId,
      tutorId: tutor.id,
      startTime,
      durationMinutes,
      status: "CONFIRMED" as const,
      seriesId: series.id,
    })),
  });

  await sendSessionEmail({
    to: student.email,
    subject: "Recurring sessions scheduled",
    heading: "A repeating session was set up",
    body: `${tutor.name} scheduled ${free.length} weekly sessions with you, starting ${formatSessionInstant(free[0])}.`,
  });

  const skipped = instants.length - free.length;
  revalidateScheduling();
  return {
    success:
      `Created ${free.length} session${free.length === 1 ? "" : "s"} for ${student.name}` +
      (skipped > 0 ? ` — ${skipped} skipped, they clashed with existing bookings.` : " ✓"),
  };
}

/** The personal .ics URL token, created on first use. */
export async function ensureCalendarToken(): Promise<string> {
  const user = await requireUser();
  const existing = await db.calendarFeedToken.findUnique({ where: { userId: user.id } });
  if (existing) return existing.token;
  const created = await db.calendarFeedToken.create({
    data: { userId: user.id, token: randomBytes(24).toString("base64url") },
  });
  return created.token;
}

/** Revoke the old subscription URL by replacing it. */
export async function regenerateCalendarToken() {
  const user = await requireUser();
  await db.calendarFeedToken.deleteMany({ where: { userId: user.id } });
  await db.calendarFeedToken.create({
    data: { userId: user.id, token: randomBytes(24).toString("base64url") },
  });
  revalidateScheduling();
}
