"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { StudentGroup } from "@/generated/prisma/enums";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/emailVerification";
import { generatePassword } from "@/lib/passwords";
import { RESET_TTL_MS, issueInvite, issueResetLink, sendInviteEmail, sendResetEmail } from "@/lib/invites";
import { isPlaceholderEmail, placeholderEmailFor } from "@/lib/students/placeholder";

export type InviteResult = { kind: "JOIN" | "RESET"; name: string; url: string; emailedTo: string | null };
export type CreateStudentState = { error?: string; invite?: InviteResult };

const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Adds a student by name and hands back a one-time join link.
 *
 * The sign-in account is created now, under a placeholder address and a random
 * password nobody sees, so enrollments, sessions and invoices set up before the
 * student joins hang off the same id they'll keep. Joining (see
 * actions/invites.ts) swaps in the student's own email and password.
 */
export async function createStudent(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const t = await getT();
  await requireTutor();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const groupRaw = String(formData.get("studentGroup") ?? "");
  const studentGroup = (Object.values(StudentGroup) as string[]).includes(groupRaw)
    ? (groupRaw as StudentGroup)
    : null;

  if (!name) return { error: t("action.nameRequired") };
  if (email && !looksLikeEmail(email)) return { error: t("action.emailInvalid") };
  if (email && (await db.user.findUnique({ where: { email }, select: { id: true } }))) {
    return { error: t("action.emailTaken") };
  }

  const placeholder = placeholderEmailFor(crypto.randomUUID());
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: placeholder,
    password: generatePassword(32),
    email_confirm: true,
  });
  if (error) return { error: t("action.accountCreateFailed", { message: error.message }) };

  const created = await db.user.create({
    data: { id: data.user.id, email: placeholder, name, role: "STUDENT", studentGroup },
  });
  const url = await issueInvite(created.id, email);
  const emailed = email ? await sendInviteEmail({ to: email, name, language: created.language, url }) : false;

  revalidatePath("/tutor/students");
  return { invite: { kind: "JOIN", name, url, emailedTo: emailed ? email : null } };
}

export type NewInviteState = { error?: string; invite?: InviteResult };

/**
 * A fresh join link for a student who hasn't joined yet. The previous link
 * stops working, which is also how a link sent to the wrong person is undone.
 */
export async function newInviteLink(studentId: string): Promise<NewInviteState> {
  const t = await getT();
  await requireTutor();
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, role: true, email: true, language: true, invite: { select: { suggestedEmail: true } } },
  });
  if (!student || student.role !== "STUDENT") return { error: t("action.notAStudent") };
  if (!isPlaceholderEmail(student.email)) return { error: t("action.alreadyJoined") };

  const suggested = student.invite?.suggestedEmail ?? null;
  const url = await issueInvite(student.id, suggested);
  const emailed = suggested
    ? await sendInviteEmail({ to: suggested, name: student.name, language: student.language, url })
    : false;
  revalidatePath("/tutor/students");
  revalidatePath(`/tutor/students/${student.id}`);
  return { invite: { kind: "JOIN", name: student.name, url, emailedTo: emailed ? suggested : null } };
}

/**
 * A one-time link for a joined student to choose a new password — what the
 * tutor sends instead of reading out a temporary one. Their current password
 * keeps working until the link is used. Emailed too when mail is set up.
 */
export async function sendPasswordResetLink(studentId: string): Promise<NewInviteState> {
  const t = await getT();
  await requireTutor();
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, role: true, email: true, language: true },
  });
  if (!student || student.role !== "STUDENT") return { error: t("action.notAStudent") };
  if (isPlaceholderEmail(student.email)) return { error: t("action.invitePendingUseLink") };

  const url = await issueResetLink(student.id, RESET_TTL_MS);
  const emailed = await sendResetEmail({ to: student.email, name: student.name, language: student.language, url, ttl: "day" });
  return { invite: { kind: "RESET", name: student.name, url, emailedTo: emailed ? student.email : null } };
}

export async function resendVerificationEmail(studentId: string) {
  await requireTutor();
  const student = await db.user.findUniqueOrThrow({ where: { id: studentId } });
  if (student.role !== "STUDENT" || student.emailVerifiedAt || isPlaceholderEmail(student.email)) return;
  await sendVerificationEmail(student);
}

export type ResetPasswordState = { error?: string; password?: string };

/**
 * Sets a fresh temporary password for a student and hands it back once, for the
 * tutor to pass on — the login screen tells students to ask for exactly this.
 *
 * Done with the admin client, which signs that student out everywhere. That's
 * the point (a forgotten password often means a shared or lost device), and it
 * doesn't touch the tutor's own session: admin updates only revoke sessions of
 * the account being changed.
 */
export async function resetStudentPassword(studentId: string): Promise<ResetPasswordState> {
  const t = await getT();
  await requireTutor();
  const student = await db.user.findUnique({ where: { id: studentId }, select: { role: true, email: true } });
  if (!student || student.role !== "STUDENT") return { error: t("action.notAStudent") };
  // No address to sign in with yet — a new join link is what they need.
  if (isPlaceholderEmail(student.email)) return { error: t("action.invitePendingUseLink") };

  const password = generatePassword();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(studentId, { password });
  if (error) return { error: t("action.resetPasswordFailed", { message: error.message }) };

  return { password };
}

export type DeleteStudentState = { error?: string };

/**
 * Deletes a student's data and then their login — in that order on purpose.
 *
 * Sessions reference the student with no cascade, so the row delete fails for
 * anyone who has ever had one. Deleting the login first (as this used to) left
 * an account that still existed but could never sign in, and whose email was
 * taken. Doing the database first means a refusal costs nothing: the account is
 * untouched and still works.
 *
 * The session rule is enforced here rather than trusted to the disabled button
 * on the student's page — the action is reachable without it.
 */
export async function deleteStudent(studentId: string): Promise<DeleteStudentState> {
  const t = await getT();
  await requireTutor();
  const student = await db.user.findUnique({ where: { id: studentId }, select: { role: true } });
  if (!student || student.role !== "STUDENT") return { error: t("action.notAStudent") };

  const sessionCount = await db.session.count({ where: { studentId } });
  if (sessionCount > 0) return { error: t("action.studentHasSessions") };

  try {
    await db.user.delete({ where: { id: studentId } });
  } catch (cause) {
    return { error: t("action.deleteStudentFailed", { message: cause instanceof Error ? cause.message : String(cause) }) };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(studentId);
  // The data is already gone; say so plainly rather than pretending it worked.
  if (error) return { error: t("action.authDeleteFailed", { message: error.message }) };

  revalidatePath("/tutor/students");
  return {};
}
