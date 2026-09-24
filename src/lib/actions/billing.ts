"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/translate";
import { BILLING_KINDS, planCharges } from "@/lib/billing/plan";
import { buildInvoiceDraft } from "@/lib/billing/draft";
import { grantPaidSyllabusRequests } from "@/lib/syllabus/grant";
import { invoiceNumber, invoiceTotal, paidTotal } from "@/lib/billing/invoice";
import { monthDates, monthInstants, parseDate, parseMonth, sessionLineLabel, todayDate } from "@/lib/billing/period";
import { parseIDR } from "@/lib/billing/money";
import type { BillingKind, InvoiceStatus } from "@/generated/prisma/enums";

export type BillingResult = { error?: string; ok?: true; invoiceId?: string };

function revalidateBilling(invoiceId?: string, studentId?: string) {
  revalidatePath("/tutor/billing");
  revalidatePath("/billing");
  if (invoiceId) {
    revalidatePath(`/tutor/billing/${invoiceId}`);
    revalidatePath(`/billing/${invoiceId}`);
  }
  if (studentId) revalidatePath(`/tutor/students/${studentId}`);
}

/**
 * A new arrangement for a student, starting on a day. Plans are never edited:
 * a price change is another row, so invoices already raised keep their price.
 */
export async function setBillingPlan(_prev: BillingResult, formData: FormData): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const studentId = String(formData.get("studentId") ?? "");
  const kind = String(formData.get("kind") ?? "") as BillingKind;
  const amount = parseIDR(String(formData.get("amount") ?? "0")) ?? 0;
  const includedRaw = String(formData.get("includedSessions") ?? "").trim();
  const startsOn = parseDate(String(formData.get("startsOn") ?? ""));

  if (!studentId) return { error: t("action.pickStudent") };
  if (!BILLING_KINDS.includes(kind)) return { error: t("billing.error.kind") };
  if (!startsOn) return { error: t("billing.error.date") };
  if (planCharges(kind) && amount <= 0) return { error: t("billing.error.amount") };
  const includedSessions = kind === "MONTHLY" && includedRaw ? Number(includedRaw) : null;
  if (includedSessions !== null && (!Number.isInteger(includedSessions) || includedSessions <= 0)) {
    return { error: t("billing.error.included") };
  }

  const courseRaw = String(formData.get("courseId") ?? "").trim();
  await db.billingPlan.create({
    data: {
      studentId,
      courseId: courseRaw || null,
      kind,
      amount: planCharges(kind) ? amount : 0,
      includedSessions,
      payer: kind === "EXTERNAL" ? String(formData.get("payer") ?? "").trim() : "",
      note: String(formData.get("note") ?? "").trim(),
      startsOn,
    },
  });
  revalidateBilling(undefined, studentId);
  return { ok: true };
}

/** A plan set by mistake can be removed; the ones before and after still apply. */
export async function deleteBillingPlan(planId: string): Promise<BillingResult> {
  await requireTutor();
  const plan = await db.billingPlan.findUnique({ where: { id: planId }, select: { studentId: true } });
  if (!plan) return { ok: true };
  await db.billingPlan.delete({ where: { id: planId } });
  revalidateBilling(undefined, plan.studentId);
  return { ok: true };
}

/**
 * The month's invoice for one student, as a draft. Sessions are grouped by
 * the subject they were for, and each subject is priced by its own
 * arrangement — Roderick is monthly for maths and per-session for coding, and
 * both land on the one invoice.
 *
 * A monthly arrangement bills its fee whether or not the month had sessions,
 * and sessions beyond its allowance aren't charged again: they carry into the
 * next month, which starts that much further along.
 */
export async function createInvoice(_prev: BillingResult, formData: FormData): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const studentId = String(formData.get("studentId") ?? "");
  const month = parseMonth(String(formData.get("month") ?? ""));
  if (!studentId) return { error: t("action.pickStudent") };
  if (!month) return { error: t("billing.error.month") };

  const student = await db.user.findFirst({ where: { id: studentId, role: "STUDENT" }, select: { id: true, language: true } });
  if (!student) return { error: t("action.studentGone") };

  const { start, end } = monthDates(month.year, month.month);
  const clash = await db.invoice.findFirst({
    where: { studentId, periodStart: start, status: { not: "VOID" } },
    select: { id: true },
  });
  if (clash) return { error: t("billing.error.exists"), invoiceId: clash.id };

  const plans = await db.billingPlan.findMany({
    where: { studentId },
    orderBy: { startsOn: "asc" },
    include: { course: { select: { title: true } } },
  });
  if (!plans.length) return { error: t("billing.error.noPlan") };

  const { from, before } = monthInstants(month.year, month.month);
  const sessions = await db.session.findMany({
    where: { studentId, status: "COMPLETED", startTime: { gte: from, lt: before }, invoiceItem: null },
    orderBy: { startTime: "asc" },
    select: { id: true, startTime: true, durationMinutes: true, attendance: true, courseId: true },
  });

  const et = makeT(student.language);
  const sessionLine = (s: { startTime: Date; durationMinutes: number; attendance: string | null }) =>
    et("billing.line.session", { when: sessionLineLabel(s.startTime, student.language), minutes: s.durationMinutes }) +
    (s.attendance === "NO_SHOW" ? ` (${et("billing.line.noShow")})` : "");

  // Titles for every subject in play, whether or not it has its own arrangement.
  const courseIds = [...new Set(sessions.map((s) => s.courseId).filter((id): id is string => id !== null))];
  const courses = courseIds.length ? await db.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true } }) : [];
  const titleOf = new Map<string | null, string | null>(courses.map((c) => [c.id, c.title]));
  for (const plan of plans) if (plan.courseId && plan.course) titleOf.set(plan.courseId, plan.course.title);

  // What each monthly subject carries in from the invoice before this one.
  const earlier = await db.invoiceAllowance.findMany({
    where: { invoice: { studentId, status: { not: "VOID" }, periodStart: { lt: start } } },
    orderBy: { invoice: { periodStart: "desc" } },
    select: { courseId: true, carryOut: true },
  });
  const carry = new Map<string | null, number>();
  for (const row of earlier) if (!carry.has(row.courseId)) carry.set(row.courseId, row.carryOut);

  const { items, allowances } = buildInvoiceDraft({
    plans,
    sessions,
    billedOn: end,
    titleOf: (courseId) => titleOf.get(courseId) ?? null,
    sessionLine,
    monthlyLine: et("billing.line.monthly"),
    carriedIn: (courseId) => carry.get(courseId) ?? 0,
  });

  if (!items.length) return { error: t("billing.error.noSessions") };

  const sequence = (await db.invoice.count({ where: { periodStart: start } })) + 1;
  const invoice = await db.invoice.create({
    data: {
      studentId,
      number: invoiceNumber(month.year, month.month, sequence),
      periodStart: start,
      periodEnd: end,
      status: "DRAFT",
      items: { create: items },
      allowances: { create: allowances },
    },
    select: { id: true },
  });
  revalidateBilling(invoice.id, studentId);
  return { ok: true, invoiceId: invoice.id };
}

async function editableInvoice(invoiceId: string) {
  return db.invoice.findUnique({ where: { id: invoiceId }, select: { id: true, status: true, studentId: true } });
}

/** A line the tutor adds by hand: a discount, materials, a session from another month. */
export async function addInvoiceItem(_prev: BillingResult, formData: FormData): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const unitAmount = parseIDR(String(formData.get("unitAmount") ?? ""));
  const invoice = await editableInvoice(invoiceId);
  if (!invoice) return { error: t("billing.error.gone") };
  if (invoice.status === "PAID" || invoice.status === "VOID") return { error: t("billing.error.locked") };
  if (!description) return { error: t("billing.error.description") };
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: t("billing.error.quantity") };
  if (unitAmount === null) return { error: t("billing.error.amount") };

  const last = await db.invoiceItem.findFirst({ where: { invoiceId }, orderBy: { order: "desc" }, select: { order: true } });
  await db.invoiceItem.create({
    data: { invoiceId, description, quantity, unitAmount, order: (last?.order ?? -1) + 1 },
  });
  revalidateBilling(invoiceId, invoice.studentId);
  return { ok: true };
}

export async function deleteInvoiceItem(itemId: string): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const item = await db.invoiceItem.findUnique({ where: { id: itemId }, select: { invoice: { select: { id: true, status: true, studentId: true } } } });
  if (!item) return { ok: true };
  if (item.invoice.status === "PAID" || item.invoice.status === "VOID") return { error: t("billing.error.locked") };
  await db.invoiceItem.delete({ where: { id: itemId } });
  revalidateBilling(item.invoice.id, item.invoice.studentId);
  return { ok: true };
}

/** The note the student reads, and when it's due. */
export async function updateInvoiceDetails(_prev: BillingResult, formData: FormData): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const invoice = await editableInvoice(invoiceId);
  if (!invoice) return { error: t("billing.error.gone") };
  if (invoice.status === "VOID") return { error: t("billing.error.locked") };
  const dueRaw = String(formData.get("dueOn") ?? "").trim();
  const dueOn = dueRaw ? parseDate(dueRaw) : null;
  if (dueRaw && !dueOn) return { error: t("billing.error.date") };
  await db.invoice.update({ where: { id: invoiceId }, data: { note: String(formData.get("note") ?? "").trim(), dueOn } });
  revalidateBilling(invoiceId, invoice.studentId);
  return { ok: true };
}

/**
 * Draft → sent makes it visible to the student; sent → paid closes it. Void
 * keeps the record but stops it counting. Going back to draft is allowed
 * while nothing has been paid, for a mistake caught early.
 */
export async function setInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, status: true, studentId: true, issuedAt: true, payments: { select: { amount: true } } },
  });
  if (!invoice) return { error: t("billing.error.gone") };
  if (status === "DRAFT" && invoice.payments.length > 0) return { error: t("billing.error.hasPayments") };
  await db.invoice.update({
    where: { id: invoiceId },
    data: { status, issuedAt: status === "SENT" && !invoice.issuedAt ? new Date() : invoice.issuedAt },
  });
  if (status === "PAID") {
    for (const syllabusId of await grantPaidSyllabusRequests(invoiceId)) revalidatePath(`/syllabus/${syllabusId}`);
    revalidatePath("/explore");
  }
  revalidateBilling(invoiceId, invoice.studentId);
  return { ok: true };
}

/**
 * Money received. An invoice that reaches its total is marked paid on the
 * spot, which is the only status change that happens by itself.
 */
export async function recordPayment(_prev: BillingResult, formData: FormData): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const amount = parseIDR(String(formData.get("amount") ?? ""));
  const paidRaw = String(formData.get("paidOn") ?? "").trim();
  const paidOn = paidRaw ? parseDate(paidRaw) : todayDate();
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, status: true, studentId: true, items: true, payments: true },
  });
  if (!invoice) return { error: t("billing.error.gone") };
  if (invoice.status === "VOID") return { error: t("billing.error.locked") };
  if (amount === null || amount <= 0) return { error: t("billing.error.amount") };
  if (!paidOn) return { error: t("billing.error.date") };

  const settled = paidTotal(invoice.payments) + amount >= invoiceTotal(invoice.items);
  await db.$transaction([
    db.payment.create({
      data: { invoiceId, amount, paidOn, method: String(formData.get("method") ?? "").trim(), note: String(formData.get("note") ?? "").trim() },
    }),
    db.invoice.update({
      where: { id: invoiceId },
      data: settled ? { status: "PAID" } : invoice.status === "DRAFT" ? { status: "SENT", issuedAt: new Date() } : {},
    }),
  ]);
  // Access follows the money: a syllabus bought on this invoice opens now.
  if (settled) {
    for (const syllabusId of await grantPaidSyllabusRequests(invoiceId)) revalidatePath(`/syllabus/${syllabusId}`);
    revalidatePath("/explore");
  }
  revalidateBilling(invoiceId, invoice.studentId);
  return { ok: true };
}

/** A payment recorded by mistake. The invoice drops back to sent if it no longer adds up. */
export async function deletePayment(paymentId: string): Promise<BillingResult> {
  await requireTutor();
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: { amount: true, invoice: { select: { id: true, status: true, studentId: true, items: true, payments: true } } },
  });
  if (!payment) return { ok: true };
  const invoice = payment.invoice;
  const left = paidTotal(invoice.payments) - payment.amount;
  await db.$transaction([
    db.payment.delete({ where: { id: paymentId } }),
    db.invoice.update({
      where: { id: invoice.id },
      data: invoice.status === "PAID" && left < invoiceTotal(invoice.items) ? { status: "SENT" } : {},
    }),
  ]);
  revalidateBilling(invoice.id, invoice.studentId);
  return { ok: true };
}

/** A draft raised by mistake. Once sent, an invoice is voided rather than deleted. */
export async function deleteInvoice(invoiceId: string): Promise<BillingResult> {
  const t = await getT();
  await requireTutor();
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, select: { status: true, studentId: true } });
  if (!invoice) return { ok: true };
  if (invoice.status !== "DRAFT") return { error: t("billing.error.onlyDraft") };
  await db.invoice.delete({ where: { id: invoiceId } });
  revalidateBilling(invoiceId, invoice.studentId);
  return { ok: true };
}

/**
 * Sets the subject on sessions in bulk. Sessions booked before subjects
 * existed have none, and a month can't be billed by subject until they do —
 * the tutor knows which was which, so this asks rather than guesses.
 */
export async function setSessionSubjects(_prev: BillingResult, formData: FormData): Promise<BillingResult> {
  const t = await getT();
  const tutor = await requireTutor();
  const ids = formData.getAll("sessionId").map(String).filter(Boolean);
  const courseId = String(formData.get("courseId") ?? "").trim() || null;
  if (!ids.length) return { error: t("subjects.error.none") };

  const { count } = await db.session.updateMany({
    where: { id: { in: ids }, tutorId: tutor.id },
    data: { courseId },
  });
  revalidatePath("/tutor/sessions/subjects");
  revalidateBilling();
  return count > 0 ? { ok: true } : { error: t("subjects.error.none") };
}
