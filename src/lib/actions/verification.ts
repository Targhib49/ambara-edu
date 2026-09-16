"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/emailVerification";

/**
 * Confirms an email address from the link's token.
 *
 * Deliberately a POST action rather than something the verify page does while
 * rendering: mail clients and security scanners fetch links before anyone
 * clicks them, which would spend the token and leave the student with a dead
 * link. The page shows a button; this runs when they press it.
 */
export async function confirmEmail(token: string) {
  const record = token ? await db.emailVerificationToken.findUnique({ where: { token } }) : null;
  if (!record) redirect("/verify-email?state=invalid");
  if (record.expiresAt < new Date()) {
    await db.emailVerificationToken.delete({ where: { id: record.id } });
    redirect("/verify-email?state=expired");
  }

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    db.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
  revalidatePath("/tutor/students");
  redirect("/verify-email?state=confirmed");
}

export type ResendState = { error?: string; success?: string };

/** A student asking for their own confirmation email again, from their profile. */
export async function resendMyVerificationEmail(): Promise<ResendState> {
  const student = await requireStudent();
  if (student.emailVerifiedAt) return { success: "Your email is already confirmed." };
  await sendVerificationEmail(student);
  return { success: `Sent — check ${student.email}.` };
}
