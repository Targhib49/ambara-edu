"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStudent, requireTutor } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/translate";
import { parseIDR } from "@/lib/billing/money";
import { invoiceNumber } from "@/lib/billing/invoice";
import { monthDates, todayDate } from "@/lib/billing/period";
import { grantSyllabus } from "@/lib/syllabus/grant";
import type { CourseStatus, SyllabusAccess } from "@/generated/prisma/enums";

export type SyllabusResult = { error?: string; ok?: true; id?: string };

function revalidateSyllabi(id?: string) {
  revalidatePath("/tutor/syllabi");
  revalidatePath("/explore");
  revalidatePath("/courses");
  if (id) {
    revalidatePath(`/tutor/syllabi/${id}`);
    revalidatePath(`/syllabus/${id}`);
  }
}

// ---------------------------------------------------------------- tutor

export async function createSyllabus(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  const t = await getT();
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: t("syllabus.error.title") };
  const syllabus = await db.syllabus.create({
    data: { title, description: String(formData.get("description") ?? "").trim() },
    select: { id: true },
  });
  revalidateSyllabi(syllabus.id);
  return { ok: true, id: syllabus.id };
}

export async function updateSyllabus(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  const t = await getT();
  await requireTutor();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const access = String(formData.get("access") ?? "REQUEST") as SyllabusAccess;
  const status = String(formData.get("status") ?? "DRAFT") as CourseStatus;
  const price = parseIDR(String(formData.get("price") ?? "0")) ?? 0;
  if (!title) return { error: t("syllabus.error.title") };
  if (price < 0) return { error: t("billing.error.amount") };
  await db.syllabus.update({
    where: { id },
    data: { title, description: String(formData.get("description") ?? "").trim(), access, status, price: access === "REQUEST" ? price : 0 },
  });
  revalidateSyllabi(id);
  return { ok: true };
}

export async function deleteSyllabus(id: string): Promise<SyllabusResult> {
  const t = await getT();
  await requireTutor();
  const granted = await db.enrollment.count({ where: { syllabusId: id } });
  if (granted > 0) return { error: t("syllabus.error.inUse") };
  await db.syllabus.delete({ where: { id } });
  revalidateSyllabi(id);
  return { ok: true };
}

/** Adds a course to the end of a syllabus. */
export async function addSyllabusCourse(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  const t = await getT();
  await requireTutor();
  const syllabusId = String(formData.get("syllabusId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) return { error: t("syllabus.error.course") };
  const exists = await db.syllabusCourse.findUnique({ where: { syllabusId_courseId: { syllabusId, courseId } }, select: { id: true } });
  if (exists) return { error: t("syllabus.error.duplicate") };
  const last = await db.syllabusCourse.findFirst({ where: { syllabusId }, orderBy: { order: "desc" }, select: { order: true } });
  await db.syllabusCourse.create({
    data: {
      syllabusId,
      courseId,
      order: (last?.order ?? -1) + 1,
      // The first course of a syllabus has nothing to wait for.
      requiresPrevious: last !== null,
    },
  });
  revalidateSyllabi(syllabusId);
  return { ok: true };
}

export async function updateSyllabusCourse(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  const t = await getT();
  await requireTutor();
  const id = String(formData.get("id") ?? "");
  const passScore = Number(formData.get("passScore") ?? 75);
  if (!Number.isInteger(passScore) || passScore < 0 || passScore > 100) return { error: t("syllabus.error.score") };
  const row = await db.syllabusCourse.update({
    where: { id },
    data: { passScore, requiresPrevious: formData.get("requiresPrevious") === "on" },
    select: { syllabusId: true },
  });
  revalidateSyllabi(row.syllabusId);
  return { ok: true };
}

export async function removeSyllabusCourse(id: string): Promise<SyllabusResult> {
  await requireTutor();
  const row = await db.syllabusCourse.findUnique({ where: { id }, select: { syllabusId: true } });
  if (!row) return { ok: true };
  await db.syllabusCourse.delete({ where: { id } });
  revalidateSyllabi(row.syllabusId);
  return { ok: true };
}

/** Moves a course up or down the order; the two rows swap places. */
export async function moveSyllabusCourse(id: string, direction: "up" | "down"): Promise<SyllabusResult> {
  await requireTutor();
  const row = await db.syllabusCourse.findUnique({ where: { id }, select: { id: true, syllabusId: true, order: true } });
  if (!row) return { ok: true };
  const neighbour = await db.syllabusCourse.findFirst({
    where: { syllabusId: row.syllabusId, order: direction === "up" ? { lt: row.order } : { gt: row.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });
  if (!neighbour) return { ok: true };
  await db.$transaction([
    db.syllabusCourse.update({ where: { id: row.id }, data: { order: neighbour.order } }),
    db.syllabusCourse.update({ where: { id: neighbour.id }, data: { order: row.order } }),
  ]);
  // Whichever course is first has nothing to wait for.
  const all = await db.syllabusCourse.findMany({ where: { syllabusId: row.syllabusId }, orderBy: { order: "asc" }, select: { id: true } });
  if (all[0]) await db.syllabusCourse.update({ where: { id: all[0].id }, data: { requiresPrevious: false } });
  revalidateSyllabi(row.syllabusId);
  return { ok: true };
}

// ---------------------------------------------------------------- access

/** A student joining a syllabus that's open to everyone. */
export async function joinSyllabus(syllabusId: string): Promise<SyllabusResult> {
  const t = await getT();
  const student = await requireStudent();
  const syllabus = await db.syllabus.findUnique({ where: { id: syllabusId }, select: { access: true, status: true } });
  if (!syllabus || syllabus.status !== "PUBLISHED") return { error: t("syllabus.error.gone") };
  if (syllabus.access !== "OPEN") return { error: t("syllabus.error.needsRequest") };
  await grantSyllabus(student.id, syllabusId);
  revalidateSyllabi(syllabusId);
  return { ok: true };
}

/** A student opening a course that's free for everyone. */
export async function joinOpenCourse(courseId: string): Promise<SyllabusResult> {
  const t = await getT();
  const student = await requireStudent();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { access: true, status: true } });
  if (!course || course.status !== "PUBLISHED" || course.access !== "OPEN") return { error: t("syllabus.error.gone") };
  await db.enrollment.createMany({ data: [{ studentId: student.id, courseId, source: "OPEN" as const }], skipDuplicates: true });
  revalidatePath("/courses");
  revalidatePath("/explore");
  return { ok: true };
}

/** A student asking for a syllabus they can't join on their own. */
export async function requestSyllabus(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  const t = await getT();
  const student = await requireStudent();
  const syllabusId = String(formData.get("syllabusId") ?? "");
  const syllabus = await db.syllabus.findUnique({ where: { id: syllabusId }, select: { status: true, access: true } });
  if (!syllabus || syllabus.status !== "PUBLISHED" || syllabus.access !== "REQUEST") return { error: t("syllabus.error.gone") };

  const existing = await db.syllabusRequest.findUnique({
    where: { studentId_syllabusId: { studentId: student.id, syllabusId } },
    select: { id: true, status: true },
  });
  const message = String(formData.get("message") ?? "").trim();
  if (existing) {
    if (existing.status === "PENDING" || existing.status === "AWAITING_PAYMENT" || existing.status === "GRANTED") {
      return { error: t("syllabus.error.alreadyAsked") };
    }
    // A declined or withdrawn request can be asked again.
    await db.syllabusRequest.update({ where: { id: existing.id }, data: { status: "PENDING", message, reply: "", decidedAt: null } });
  } else {
    await db.syllabusRequest.create({ data: { studentId: student.id, syllabusId, message } });
  }
  revalidateSyllabi(syllabusId);
  revalidatePath("/tutor");
  return { ok: true };
}

export async function withdrawRequest(requestId: string): Promise<SyllabusResult> {
  const student = await requireStudent();
  const request = await db.syllabusRequest.findUnique({ where: { id: requestId }, select: { studentId: true, status: true } });
  if (!request || request.studentId !== student.id) return { ok: true };
  if (request.status === "GRANTED") return { ok: true };
  await db.syllabusRequest.update({ where: { id: requestId }, data: { status: "WITHDRAWN" } });
  revalidateSyllabi();
  return { ok: true };
}

/**
 * The tutor approving a request. A syllabus with a price raises an invoice and
 * waits for it — Targhib's rule: payment first, then access. A free one opens
 * straight away.
 */
export async function approveRequest(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  const t = await getT();
  await requireTutor();
  const requestId = String(formData.get("requestId") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  const request = await db.syllabusRequest.findUnique({
    where: { id: requestId },
    include: { syllabus: { select: { id: true, title: true, price: true } }, student: { select: { id: true, language: true } } },
  });
  if (!request) return { error: t("syllabus.error.gone") };
  if (request.status === "GRANTED") return { error: t("syllabus.error.alreadyGranted") };

  if (request.syllabus.price <= 0) {
    await grantSyllabus(request.studentId, request.syllabusId);
    await db.syllabusRequest.update({ where: { id: requestId }, data: { status: "GRANTED", reply, decidedAt: new Date() } });
    revalidateSyllabi(request.syllabusId);
    return { ok: true };
  }

  // One invoice for this syllabus, in the month it was approved.
  const today = todayDate();
  const { start, end } = monthDates(today.getUTCFullYear(), today.getUTCMonth() + 1);
  const sequence = (await db.invoice.count({ where: { periodStart: start } })) + 1;
  const et = makeT(request.student.language);
  const invoice = await db.invoice.create({
    data: {
      studentId: request.studentId,
      number: invoiceNumber(today.getUTCFullYear(), today.getUTCMonth() + 1, sequence),
      periodStart: start,
      periodEnd: end,
      status: "SENT",
      issuedAt: new Date(),
      note: reply,
      items: { create: [{ description: et("syllabus.invoiceLine", { title: request.syllabus.title }), quantity: 1, unitAmount: request.syllabus.price, order: 0 }] },
    },
    select: { id: true },
  });
  await db.syllabusRequest.update({
    where: { id: requestId },
    data: { status: "AWAITING_PAYMENT", reply, invoiceId: invoice.id, decidedAt: new Date() },
  });
  revalidateSyllabi(request.syllabusId);
  revalidatePath("/tutor/billing");
  return { ok: true, id: invoice.id };
}

export async function declineRequest(_prev: SyllabusResult, formData: FormData): Promise<SyllabusResult> {
  await requireTutor();
  const requestId = String(formData.get("requestId") ?? "");
  await db.syllabusRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED", reply: String(formData.get("reply") ?? "").trim(), decidedAt: new Date() },
  });
  revalidateSyllabi();
  return { ok: true };
}
