"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getLanguage, getT } from "@/lib/i18n/server";
import { SELF_RESET_TTL_MS, hashInviteToken, issueResetLink, sendResetEmail } from "@/lib/invites";
import { isEmailConfigured } from "@/lib/email";
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
  if (!invite || invite.kind !== "JOIN" || invite.expiresAt < new Date() || !isPlaceholderEmail(invite.user.email)) {
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

export type ResetPasswordLinkState = { error?: string };

/**
 * Choosing a new password from a reset link. Like joining, it runs only on a
 * button press, spends the link, and leaves the person signed in. The admin
 * update signs them out everywhere else, which is what a forgotten password on
 * a shared or lost device calls for.
 */
export async function acceptReset(
  token: string,
  _prev: ResetPasswordLinkState,
  formData: FormData
): Promise<ResetPasswordLinkState> {
  const t = await getT();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const link = await db.studentInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { user: { select: { email: true } } },
  });
  if (!link || link.kind !== "RESET" || link.expiresAt < new Date()) redirect(`/reset/${token}`);

  if (password.length < 8) return { error: t("action.passwordShort") };
  if (password !== confirm) return { error: t("join.mismatch") };

  const { count } = await db.studentInvite.deleteMany({ where: { id: link.id } });
  if (count === 0) redirect(`/reset/${token}`);

  const { error } = await createSupabaseAdminClient().auth.admin.updateUserById(link.userId, { password });
  if (error) {
    const { id, userId, kind, tokenHash, suggestedEmail, expiresAt } = link;
    await db.studentInvite.create({ data: { id, userId, kind, tokenHash, suggestedEmail, expiresAt } });
    return { error: t("reset.failed", { message: error.message }) };
  }

  const session = await createSupabaseServerClient();
  await session.auth.signOut();
  const { error: signInError } = await session.auth.signInWithPassword({ email: link.user.email, password });
  redirect(signInError ? "/login" : "/");
}

export type RequestResetState = { sent?: boolean; error?: string };

/** Don't mail the same inbox more than this often, however many times the button is pressed. */
const RESEND_GAP_MS = 2 * 60_000;

/**
 * "Email me a reset link" from the sign-in screen. Always answers the same
 * way whether or not the address has an account, so the form can't be used to
 * find out who studies here.
 */
export async function requestPasswordReset(_prev: RequestResetState, formData: FormData): Promise<RequestResetState> {
  const t = await getT();
  if (!isEmailConfigured()) return { error: t("forgot.noMail") };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!looksLikeEmail(email)) return { error: t("action.emailInvalid") };

  const user = isPlaceholderEmail(email)
    ? null
    : await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, language: true, invite: { select: { kind: true, createdAt: true } } },
      });
  const recent =
    user?.invite?.kind === "RESET" && Date.now() - user.invite.createdAt.getTime() < RESEND_GAP_MS;
  if (user && !recent) {
    const url = await issueResetLink(user.id, SELF_RESET_TTL_MS);
    await sendResetEmail({ to: email, name: user.name, language: user.language, url, ttl: "hour" });
  }
  return { sent: true };
}
