"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { requireTutor, requireStudent } from "@/lib/auth";
import { sendSessionEmail } from "@/lib/email";
import { formatSessionInstant } from "@/lib/sessions/format";
import { BOOKING_HORIZON_DAYS, generateSlots, fromLocalParts } from "@/lib/scheduling";

function revalidateSessions() {
  revalidatePath("/tutor/sessions");
  revalidatePath("/sessions");
}

export type CreateSessionState = { error?: string; success?: string };

/**
 * "2026-09-20T16:00" from the schedule form, read as app time (WIB). `new Date()`
 * would read it in the server's own zone — UTC on Vercel — and put the session
 * seven hours later than the tutor picked.
 */
function parseAppDateTime(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return new Date(NaN);
  return fromLocalParts(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]) * 60 + Number(m[5]));
}

export async function createSession(
  _prev: CreateSessionState,
  formData: FormData
): Promise<CreateSessionState> {
  const t = await getT();
  const tutor = await requireTutor();
  const studentId = String(formData.get("studentId") ?? "");
  const startTime = parseAppDateTime(String(formData.get("startTime") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  if (!studentId) return { error: t("action.pickStudent") };
  if (Number.isNaN(startTime.getTime())) return { error: t("action.pickValidStart") };
  if (!durationMinutes || durationMinutes < 15) return { error: t("action.durationMin15") };

  const student = await db.user.findUnique({ where: { id: studentId } });
  if (!student) return { error: t("action.studentGone") };
  await db.session.create({
    data: { studentId, tutorId: tutor.id, startTime, durationMinutes, status: "CONFIRMED" },
  });

  await sendSessionEmail({
    to: student.email,
    subject: "New session scheduled",
    heading: "A new session has been scheduled",
    body: `${tutor.name} scheduled a ${durationMinutes}-minute session with you for ${formatSessionInstant(startTime)}.`,
  });

  revalidateSessions();
  return { success: `Session with ${student.name} scheduled ✓` };
}

export async function updateSessionNotes(sessionId: string, notes: string) {
  await requireTutor();
  await db.session.update({ where: { id: sessionId }, data: { notes } });
  revalidateSessions();
}

export async function moveSession(sessionId: string, newStartTimeIso: string) {
  const tutor = await requireTutor();
  const newStartTime = new Date(newStartTimeIso);
  if (Number.isNaN(newStartTime.getTime())) return;

  const session = await db.session.update({
    where: { id: sessionId },
    data: { startTime: newStartTime, status: "CONFIRMED", proposedAltTime: null },
    include: { student: true },
  });

  await sendSessionEmail({
    to: session.student.email,
    subject: "Your session was rescheduled",
    heading: "Your tutor moved a session",
    body: `${tutor.name} moved your session to ${formatSessionInstant(newStartTime)}.`,
  });

  revalidateSessions();
}

export async function cancelSession(sessionId: string) {
  const tutor = await requireTutor();
  const session = await db.session.update({
    where: { id: sessionId },
    data: { status: "CANCELLED", proposedAltTime: null },
    include: { student: true },
  });

  await sendSessionEmail({
    to: session.student.email,
    subject: "Your session was cancelled",
    heading: "A session was cancelled",
    body: `${tutor.name} cancelled your session that was scheduled for ${formatSessionInstant(session.startTime)}.`,
  });

  revalidateSessions();
}

export async function requestReschedule(sessionId: string, altTimeIso: string) {
  const student = await requireStudent();
  const altTime = new Date(altTimeIso);
  if (Number.isNaN(altTime.getTime())) return;

  const existing = await db.session.findUniqueOrThrow({ where: { id: sessionId } });
  if (existing.studentId !== student.id || existing.status !== "CONFIRMED") return;

  const session = await db.session.update({
    where: { id: sessionId },
    data: { status: "RESCHEDULE_REQUESTED_BY_STUDENT", proposedAltTime: altTime },
    include: { tutor: true },
  });

  await sendSessionEmail({
    to: session.tutor.email,
    subject: "Reschedule requested",
    heading: "A student requested a reschedule",
    body: `${student.name} asked to move their ${formatSessionInstant(session.startTime)} session to ${formatSessionInstant(altTime)}. Accept or propose another time in the Sessions tab.`,
  });

  revalidateSessions();
}

export async function tutorRespondToReschedule(
  sessionId: string,
  action: "accept" | "counter",
  altTimeIso?: string
) {
  const tutor = await requireTutor();
  const existing = await db.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: { student: true },
  });
  if (existing.status !== "RESCHEDULE_REQUESTED_BY_STUDENT") return;

  if (action === "accept") {
    if (!existing.proposedAltTime) return;
    const session = await db.session.update({
      where: { id: sessionId },
      data: { startTime: existing.proposedAltTime, status: "CONFIRMED", proposedAltTime: null },
    });
    await sendSessionEmail({
      to: existing.student.email,
      subject: "Reschedule accepted",
      heading: "Your reschedule request was accepted",
      body: `${tutor.name} confirmed your session for ${formatSessionInstant(session.startTime)}.`,
    });
    revalidateSessions();
    return;
  }

  const altTime = new Date(altTimeIso ?? "");
  if (Number.isNaN(altTime.getTime())) return;
  await db.session.update({
    where: { id: sessionId },
    data: { status: "RESCHEDULE_REQUESTED_BY_TUTOR", proposedAltTime: altTime },
  });
  await sendSessionEmail({
    to: existing.student.email,
    subject: "Your tutor proposed a different time",
    heading: "A different time was proposed",
    body: `${tutor.name} proposed moving your session to ${formatSessionInstant(altTime)} instead. Accept or counter-propose in the Sessions tab.`,
  });
  revalidateSessions();
}

export async function studentRespondToReschedule(
  sessionId: string,
  action: "accept" | "counter",
  altTimeIso?: string
) {
  const student = await requireStudent();
  const existing = await db.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: { tutor: true },
  });
  if (existing.studentId !== student.id || existing.status !== "RESCHEDULE_REQUESTED_BY_TUTOR") {
    return;
  }

  if (action === "accept") {
    if (!existing.proposedAltTime) return;
    const session = await db.session.update({
      where: { id: sessionId },
      data: { startTime: existing.proposedAltTime, status: "CONFIRMED", proposedAltTime: null },
    });
    await sendSessionEmail({
      to: existing.tutor.email,
      subject: "Reschedule accepted",
      heading: "Your proposed time was accepted",
      body: `${student.name} confirmed the session for ${formatSessionInstant(session.startTime)}.`,
    });
    revalidateSessions();
    return;
  }

  const altTime = new Date(altTimeIso ?? "");
  if (Number.isNaN(altTime.getTime())) return;
  await db.session.update({
    where: { id: sessionId },
    data: { status: "RESCHEDULE_REQUESTED_BY_STUDENT", proposedAltTime: altTime },
  });
  await sendSessionEmail({
    to: existing.tutor.email,
    subject: "Student proposed a different time",
    heading: "A different time was proposed",
    body: `${student.name} countered with ${formatSessionInstant(altTime)} instead. Accept or propose another time in the Sessions tab.`,
  });
  revalidateSessions();
}

export type SessionActionResult = { error?: string };

/** Notes and reasons are free text going into an HTML email body. */
function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function ownSession(tutorId: string, sessionId: string) {
  const session = await db.session.findUnique({ where: { id: sessionId }, include: { student: true } });
  return session && session.tutorId === tutorId ? session : null;
}

/**
 * Close out a session that has happened: attendance for the tutor's records,
 * notes the student reads afterwards. Also used to edit a completed session's
 * notes, so COMPLETED is allowed back in.
 */
export async function completeSession(
  sessionId: string,
  input: { attendance: "ATTENDED" | "NO_SHOW"; notes: string }
): Promise<SessionActionResult> {
  const t = await getT();
  const tutor = await requireTutor();
  const session = await ownSession(tutor.id, sessionId);
  if (!session) return { error: t("action.sessionGone") };
  if (session.status === "CANCELLED") return { error: t("action.cancelledNotDone") };
  if (session.startTime.getTime() > Date.now()) return { error: t("action.notStartedYet") };
  if (input.attendance !== "ATTENDED" && input.attendance !== "NO_SHOW") {
    return { error: t("action.chooseAttendance") };
  }

  const notes = input.notes.trim();
  const hadNotes = session.notes.trim();
  await db.session.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", attendance: input.attendance, notes, proposedAltTime: null },
  });

  // Only email when there's something new to read.
  if (notes && notes !== hadNotes) {
    await sendSessionEmail({
      to: session.student.email,
      subject: "Notes from your session",
      heading: "Session notes",
      body: `${escapeHtml(tutor.name)} left notes on your ${formatSessionInstant(session.startTime)} session:\n\n${escapeHtml(notes)}`,
    });
  }
  revalidateSessions();
  return {};
}

/**
 * Cancel with a reason the student sees. With `offerReschedule` the session
 * isn't dropped: it waits for the student to pick a new time from the tutor's
 * availability, so the lesson isn't simply lost.
 */
export async function cancelSessionWithReason(
  sessionId: string,
  input: { reason: string; offerReschedule: boolean }
): Promise<SessionActionResult> {
  const t = await getT();
  const tutor = await requireTutor();
  const reason = input.reason.trim();
  if (!reason) return { error: t("action.reasonRequired") };
  const session = await ownSession(tutor.id, sessionId);
  if (!session) return { error: t("action.sessionGone") };
  if (session.status === "CANCELLED" || session.status === "COMPLETED") {
    return { error: t("action.sessionClosed") };
  }

  if (input.offerReschedule) {
    await db.session.update({
      where: { id: sessionId },
      data: { status: "AWAITING_RESCHEDULE", statusReason: reason, proposedAltTime: null },
    });
    await sendSessionEmail({
      to: session.student.email,
      subject: "Your session needs a new time",
      heading: "Please pick a new time",
      body: `${escapeHtml(tutor.name)} can't make your ${formatSessionInstant(session.startTime)} session.\n\nReason: ${escapeHtml(reason)}\n\nChoose a new time from the open slots on your Sessions page.`,
    });
  } else {
    await db.session.update({
      where: { id: sessionId },
      data: { status: "CANCELLED", statusReason: reason, cancelledAt: new Date(), proposedAltTime: null },
    });
    await sendSessionEmail({
      to: session.student.email,
      subject: "Your session was cancelled",
      heading: "A session was cancelled",
      body: `${escapeHtml(tutor.name)} cancelled your ${formatSessionInstant(session.startTime)} session.\n\nReason: ${escapeHtml(reason)}`,
    });
  }
  revalidateSessions();
  return {};
}

/** Tutor-initiated reschedule: the student chooses the new time from open availability. */
export async function requestStudentReschedule(
  sessionId: string,
  input: { note: string }
): Promise<SessionActionResult> {
  const t = await getT();
  const tutor = await requireTutor();
  const session = await ownSession(tutor.id, sessionId);
  if (!session) return { error: t("action.sessionGone") };
  if (session.status !== "CONFIRMED" && session.status !== "PROPOSED") {
    return { error: t("action.onlyConfirmedReschedule") };
  }
  const note = input.note.trim();
  await db.session.update({
    where: { id: sessionId },
    data: { status: "AWAITING_RESCHEDULE", statusReason: note || null, proposedAltTime: null },
  });
  await sendSessionEmail({
    to: session.student.email,
    subject: "Please pick a new time for your session",
    heading: "Your session is being rescheduled",
    body: `${escapeHtml(tutor.name)} needs to move your ${formatSessionInstant(session.startTime)} session.${note ? `\n\n${escapeHtml(note)}` : ""}\n\nChoose a new time from the open slots on your Sessions page.`,
  });
  revalidateSessions();
  return {};
}

/**
 * The student's half of a reschedule. Like booking, the chosen time is never
 * trusted: slots are regenerated from the tutor's live availability, with this
 * session's own old time released, and the pick must still be open.
 */
export async function studentPickRescheduleSlot(
  sessionId: string,
  availabilityId: string,
  startIso: string
): Promise<SessionActionResult> {
  const t = await getT();
  const student = await requireStudent();
  const session = await db.session.findUnique({ where: { id: sessionId }, include: { tutor: true } });
  if (!session || session.studentId !== student.id) return { error: t("action.sessionGone") };
  if (session.status !== "AWAITING_RESCHEDULE") return { error: t("action.notAwaitingTime") };

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return { error: t("action.timeInvalid") };

  const window = await db.availability.findFirst({
    where: { id: availabilityId, tutorId: session.tutorId, active: true },
  });
  if (!window) return { error: t("action.timeNotOffered") };
  if (window.durationMinutes < session.durationMinutes) return { error: t("action.slotTooShort") };

  const busy = await db.session.findMany({
    where: {
      tutorId: session.tutorId,
      id: { not: session.id },
      status: { notIn: ["CANCELLED", "AWAITING_RESCHEDULE"] },
    },
    select: { startTime: true, durationMinutes: true },
  });
  const open = generateSlots([window], busy, new Date(), BOOKING_HORIZON_DAYS).some(
    (slot) => slot.start.getTime() === start.getTime()
  );
  if (!open) return { error: t("action.justTaken") };

  await db.session.update({
    where: { id: session.id },
    data: { startTime: start, status: "CONFIRMED", statusReason: null, proposedAltTime: null },
  });
  await sendSessionEmail({
    to: session.tutor.email,
    subject: "Session rescheduled",
    heading: "Your student picked a new time",
    body: `${escapeHtml(student.name)} moved their session to ${formatSessionInstant(start)}.`,
  });
  revalidateSessions();
  return {};
}
