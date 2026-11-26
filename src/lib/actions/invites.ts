"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getLanguage, getT } from "@/lib/i18n/server";
import { hashInviteToken } from "@/lib/invites";
import { isPlaceholderEmail } from "@/lib/students/placeholder";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AcceptInviteState = { error?: string; email?: string };

const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * A student turning their join link into their own sign-in: their email and
 * password replace the placeholder ones on the account the tutor made, so
 * everything already attached to it stays. Public — the token is the only
 * credential, and it's spent here.
 *
 * Like email confirmation, this runs on a button press, never on page load:
 * WhatsApp and mail scanners open links before people do.
 */
export async function acceptInvite(
  token: string,
  _prev: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const t = await getT();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invite = await db.studentInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { user: { select: { id: true, email: true } } },
  });
  // The page already showed a friendly dead end for these; reload into it.
  if (!invite || invite.expiresAt < new Date() || !isPlaceholderEmail(invite.user.email)) {
    redirect(`/join/${token}`);
  }

  if (!looksLikeEmail(email) || isPlaceholderEmail(email)) return { error: t("action.emailInvalid"), email };
  if (password.length < 8) return { error: t("action.passwordShort"), email };
  if (password !== confirm) return { error: t("join.mismatch"), email };
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: t("join.emailTaken"), email };
  }

  // Claim the link first, so two tabs pressing at once can't both use it.
  const { count } = await db.studentInvite.deleteMany({ where: { id: invite.id } });
  if (count === 0) redirect(`/join/${token}`);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(invite.userId, {
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    // Give the link back so they can try another address.
    const { id, userId, tokenHash, suggestedEmail, expiresAt } = invite;
    await db.studentInvite.create({ data: { id, userId, tokenHash, suggestedEmail, expiresAt } });
    const taken = /already|registered|exists/i.test(error.message);
    return { error: taken ? t("join.emailTaken") : t("join.failed", { message: error.message }), email };
  }

  await db.user.update({
    where: { id: invite.userId },
    // They just typed it, and keep the language they read this page in.
    data: { email, emailVerifiedAt: new Date(), language: await getLanguage() },
  });
  revalidatePath("/tutor/students");

  // Replaces whoever was signed in on this browser (say, the tutor checking the link).
  const session = await createSupabaseServerClient();
  await session.auth.signOut();
  const { error: signInError } = await session.auth.signInWithPassword({ email, password });
  redirect(signInError ? "/login" : "/");
}
