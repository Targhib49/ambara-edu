"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { hashInviteToken } from "@/lib/invites";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AcceptInviteState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A student turning their invite link into their own login.
 *
 * The link is spent first, in one conditional update, so two tabs pressing the
 * button at once can't both succeed. If anything after that fails, the link is
 * handed back so the student can simply try again.
 */
export async function acceptInvite(
  token: string,
  _prev: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const t = await getT();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!EMAIL_RE.test(email)) return { error: t("join.badEmail") };
  if (password.length < 8) return { error: t("action.passwordShort") };
  if (password !== confirm) return { error: t("join.mismatch") };

  const tokenHash = hashInviteToken(token);
  const now = new Date();
  const claimed = await db.studentInvite.updateMany({
    where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });
  if (claimed.count !== 1) return { error: t("join.linkGone") };
  const invite = await db.studentInvite.findUniqueOrThrow({ where: { tokenHash }, select: { userId: true } });
  const giveBack = () => db.studentInvite.update({ where: { tokenHash }, data: { usedAt: null } });

  const owner = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (owner && owner.id !== invite.userId) {
    await giveBack();
    return { error: t("action.emailTaken") };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(invite.userId, {
    email,
    password,
    // They just typed it into a link only they were given; asking them to
    // confirm it again straight away would be a second hoop for nothing.
    email_confirm: true,
  });
  if (error) {
    await giveBack();
    return { error: t("join.failed", { message: error.message }) };
  }

  await db.user.update({
    where: { id: invite.userId },
    data: { email, emailVerifiedAt: now, joinedAt: now },
  });
  revalidatePath("/tutor/students");

  // Signs in as the student, replacing whoever was signed in on this browser.
  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  redirect(signInError ? "/login" : "/dashboard");
}
