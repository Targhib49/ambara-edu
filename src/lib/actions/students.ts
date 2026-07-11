"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { StudentGroup } from "@/generated/prisma/enums";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CreateStudentState = { error?: string; success?: string };

export async function createStudent(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  await requireTutor();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const groupRaw = String(formData.get("studentGroup") ?? "");
  const studentGroup = (Object.values(StudentGroup) as string[]).includes(groupRaw)
    ? (groupRaw as StudentGroup)
    : null;

  if (!name || !email) return { error: "Name and email are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // no email verification flow — tutor hands out credentials
  });
  if (error) return { error: `Could not create account: ${error.message}` };

  await db.user.create({
    data: { id: data.user.id, email, name, role: "STUDENT", studentGroup },
  });

  revalidatePath("/tutor/students");
  return { success: `Created ${email} — hand them the password you just set.` };
}

export async function deleteStudent(studentId: string) {
  await requireTutor();
  const student = await db.user.findUniqueOrThrow({ where: { id: studentId } });
  if (student.role !== "STUDENT") return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(studentId);
  if (error) throw new Error(`Could not delete auth account: ${error.message}`);

  await db.user.delete({ where: { id: studentId } });
  revalidatePath("/tutor/students");
}
