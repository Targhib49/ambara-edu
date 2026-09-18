"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: string };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const t = await getT();
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !email) return { error: t("action.nameEmailRequired") };

  if (email !== user.email) {
    const taken = await db.user.findUnique({ where: { email } });
    if (taken) return { error: t("action.emailTaken") };

    const supabase = createSupabaseAdminClient();
    // email_confirm skips the verification round-trip — accounts here are
    // tutor-managed and no email infra is configured (RESEND_API_KEY is a
    // placeholder), so a confirmation link would never arrive.
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
    });
    if (error) return { error: t("action.emailUpdateFailed", { message: error.message }) };
  }

  await db.user.update({ where: { id: user.id }, data: { name, email } });

  revalidatePath("/", "layout");
  return {
    success:
      email !== user.email
        ? t("action.profileUpdatedNewEmail")
        : t("action.profileUpdated"),
  };
}

export async function changePassword(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const t = await getT();
  const user = await requireUser();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) return { error: t("action.newPasswordShort") };
  if (newPassword !== confirmPassword) return { error: t("action.passwordsDiffer") };

  // Verify the current password with a throwaway client so the sign-in
  // doesn't touch this request's session cookies.
  const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: t("action.currentPasswordWrong") };

  // Update through the session-bound client, not the admin API — the admin
  // route revokes every session for the user, including the one making this
  // very request (the action then dies mid-flight and the user is logged out).
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: t("action.passwordChangeFailed", { message: error.message }) };

  return { success: t("action.passwordChanged") };
}
