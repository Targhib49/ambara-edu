"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/translate";
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
    data: {
      studentId,
      tutorId: tutor.id,
      startTime,
      durationMinutes,
      status: "CONFIRMED",
      // What the session is for, so billing can price it by subject.
      courseId: String(formData.get("courseId") ?? "").trim() || null,
    },
  });

  // Email copy follows the recipient's language, not the tutor's.
  const et = makeT(student.language);
  await sendSessionEmail({
    to: student.email,
    subject: et("email.newSession.subject"),
    heading: et("email.newSession.heading"),
    body: et("email.newSession.body", {
      tutor: tutor.name,
      minutes: durationMinutes,
      when: formatSessionInstant(startTime, student.language),
    }),
  });

  revalidateSessions();
  return { success: t("action.sessionScheduled", { name: student.name }) };
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

  const et = makeT(session.student.language);
  await sendSessionEmail({
    to: session.student.email,
    subject: et("email.moved.subject"),
    heading: et("email.moved.heading"),
    body: et("email.moved.body", { tutor: tutor.name, when: formatSessionInstant(newStartTime, session.student.language) }),
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

  const et = makeT(session.student.language);
  await sendSessionEmail({
    to: session.student.email,
    subject: et("email.cancelled.subject"),
    heading: et("email.cancelled.heading"),
    body: et("email.cancelled.body", {
      tutor: tutor.name,
      when: formatSessionInstant(session.startTime, session.student.language),
    }),
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

  const et = makeT(session.tutor.language);
  await sendSessionEmail({
    to: session.tutor.email,
    subject: et("email.studentRequested.subject"),
    heading: et("email.studentRequested.heading"),
    body: et("email.studentRequested.body", {
      student: student.name,
      from: formatSessionInstant(session.startTime, session.tutor.language),
      to: formatSessionInstant(altTime, session.tutor.language),
    }),
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
  const et = makeT(existing.student.language);

  if (action === "accept") {
    if (!existing.proposedAltTime) return;
    const session = await db.session.update({
      where: { id: sessionId },
      data: { startTime: existing.proposedAltTime, status: "CONFIRMED", proposedAltTime: null },
    });
    await sendSessionEmail({
      to: existing.student.email,
      subject: et("email.rescheduleAccepted.subject"),
      heading: et("email.rescheduleAccepted.heading"),
      body: et("email.rescheduleAccepted.body", {
        tutor: tutor.name,
        when: formatSessionInstant(session.startTime, existing.student.language),
      }),
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
    subject: et("email.tutorProposed.subject"),
    heading: et("email.proposedHeading"),
    body: et("email.tutorProposed.body", {
      tutor: tutor.name,
      when: formatSessionInstant(altTime, existing.student.language),
    }),
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
  const et = makeT(existing.tutor.language);

  if (action === "accept") {
    if (!existing.proposedAltTime) return;
    const session = await db.session.update({
      where: { id: sessionId },
      data: { startTime: existing.proposedAltTime, status: "CONFIRMED", proposedAltTime: null },
    });
    await sendSessionEmail({
      to: existing.tutor.email,
      subject: et("email.rescheduleAccepted.subject"),
      heading: et("email.proposalAccepted.heading"),
      body: et("email.proposalAccepted.body", {
        student: student.name,
        when: formatSessionInstant(session.startTime, existing.tutor.language),
      }),
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
    subject: et("email.studentProposed.subject"),
    heading: et("email.proposedHeading"),
    body: et("email.studentProposed.body", {
      student: student.name,
      when: formatSessionInstant(altTime, existing.tutor.language),
    }),
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
    const et = makeT(session.student.language);
    await sendSessionEmail({
      to: session.student.email,
      subject: et("email.notes.subject"),
      heading: et("email.notes.heading"),
      body: et("email.notes.body", {
        tutor: escapeHtml(tutor.name),
        when: formatSessionInstant(session.startTime, session.student.language),
        notes: escapeHtml(notes),
      }),
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
  const et = makeT(session.student.language);

  if (input.offerReschedule) {
    await db.session.update({
      where: { id: sessionId },
      data: { status: "AWAITING_RESCHEDULE", statusReason: reason, proposedAltTime: null },
    });
    await sendSessionEmail({
      to: session.student.email,
      subject: et("email.needsNewTime.subject"),
      heading: et("email.needsNewTime.heading"),
      body: et("email.needsNewTime.body", {
        tutor: escapeHtml(tutor.name),
        when: formatSessionInstant(session.startTime, session.student.language),
        reason: escapeHtml(reason),
      }),
    });
  } else {
    await db.session.update({
      where: { id: sessionId },
      data: { status: "CANCELLED", statusReason: reason, cancelledAt: new Date(), proposedAltTime: null },
    });
    await sendSessionEmail({
      to: session.student.email,
      subject: et("email.cancelled.subject"),
      heading: et("email.cancelled.heading"),
      body: et("email.cancelledReason.body", {
        tutor: escapeHtml(tutor.name),
        when: formatSessionInstant(session.startTime, session.student.language),
        reason: escapeHtml(reason),
      }),
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
  const et = makeT(session.student.language);
  await sendSessionEmail({
    to: session.student.email,
    subject: et("email.beingRescheduled.subject"),
    heading: et("email.beingRescheduled.heading"),
    body: et("email.beingRescheduled.body", {
      tutor: escapeHtml(tutor.name),
      when: formatSessionInstant(session.startTime, session.student.language),
      note: note ? `\n\n${escapeHtml(note)}` : "",
    }),
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
  const et = makeT(session.tutor.language);
  await sendSessionEmail({
    to: session.tutor.email,
    subject: et("email.studentPicked.subject"),
    heading: et("email.studentPicked.heading"),
    body: et("email.studentPicked.body", {
      student: escapeHtml(student.name),
      when: formatSessionInstant(start, session.tutor.language),
    }),
  });
  revalidateSessions();
  return {};
}
