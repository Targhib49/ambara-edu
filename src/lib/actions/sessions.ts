"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor, requireStudent } from "@/lib/auth";
import { sendSessionEmail } from "@/lib/email";

function formatUtc(date: Date) {
  return (
    date.toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }) + " UTC"
  );
}

function revalidateSessions() {
  revalidatePath("/tutor/sessions");
  revalidatePath("/sessions");
}

export type CreateSessionState = { error?: string; success?: string };

export async function createSession(
  _prev: CreateSessionState,
  formData: FormData
): Promise<CreateSessionState> {
  const tutor = await requireTutor();
  const studentId = String(formData.get("studentId") ?? "");
  const startTime = new Date(String(formData.get("startTime") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  if (!studentId) return { error: "Pick a student." };
  if (Number.isNaN(startTime.getTime())) return { error: "Pick a valid start time." };
  if (!durationMinutes || durationMinutes < 15) return { error: "Duration must be at least 15 minutes." };

  const student = await db.user.findUnique({ where: { id: studentId } });
  if (!student) return { error: "That student no longer exists." };
  await db.session.create({
    data: { studentId, tutorId: tutor.id, startTime, durationMinutes, status: "CONFIRMED" },
  });

  await sendSessionEmail({
    to: student.email,
    subject: "New session scheduled",
    heading: "A new session has been scheduled",
    body: `${tutor.name} scheduled a ${durationMinutes}-minute session with you for ${formatUtc(startTime)}.`,
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
    body: `${tutor.name} moved your session to ${formatUtc(newStartTime)}.`,
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
    body: `${tutor.name} cancelled your session that was scheduled for ${formatUtc(session.startTime)}.`,
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
    body: `${student.name} asked to move their ${formatUtc(session.startTime)} session to ${formatUtc(altTime)}. Accept or propose another time in the Sessions tab.`,
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
      body: `${tutor.name} confirmed your session for ${formatUtc(session.startTime)}.`,
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
    body: `${tutor.name} proposed moving your session to ${formatUtc(altTime)} instead. Accept or counter-propose in the Sessions tab.`,
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
      body: `${student.name} confirmed the session for ${formatUtc(session.startTime)}.`,
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
    body: `${student.name} countered with ${formatUtc(altTime)} instead. Accept or propose another time in the Sessions tab.`,
  });
  revalidateSessions();
}
