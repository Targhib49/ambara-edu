"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { StudentGroup } from "@/generated/prisma/enums";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/emailVerification";
import { generatePassword } from "@/lib/passwords";

export type CreateStudentState = { error?: string; success?: string };

export async function createStudent(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const t = await getT();
  await requireTutor();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const groupRaw = String(formData.get("studentGroup") ?? "");
  const studentGroup = (Object.values(StudentGroup) as string[]).includes(groupRaw)
    ? (groupRaw as StudentGroup)
    : null;

  if (!name || !email) return { error: t("action.nameEmailRequired") };
  if (password.length < 8) return { error: t("action.passwordShort") };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skips Supabase's own confirmation UI — our own
    // informational verification (below) runs separately and never gates login
  });
  if (error) return { error: `Could not create account: ${error.message}` };

  await db.user.create({
    data: { id: data.user.id, email, name, role: "STUDENT", studentGroup },
  });
  await sendVerificationEmail({ id: data.user.id, email, name });

  revalidatePath("/tutor/students");
  return { success: `Created ${email} — hand them the password you just set.` };
}

export async function resendVerificationEmail(studentId: string) {
  await requireTutor();
  const student = await db.user.findUniqueOrThrow({ where: { id: studentId } });
  if (student.role !== "STUDENT" || student.emailVerifiedAt) return;
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
  const student = await db.user.findUnique({ where: { id: studentId }, select: { role: true } });
  if (!student || student.role !== "STUDENT") return { error: t("action.notAStudent") };

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
