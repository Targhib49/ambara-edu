"use server";

import { revalidatePath } from "next/cache";
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
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !email) return { error: "Name and email are required." };

  if (email !== user.email) {
    const taken = await db.user.findUnique({ where: { email } });
    if (taken) return { error: "That email is already in use by another account." };

    const supabase = createSupabaseAdminClient();
    // email_confirm skips the verification round-trip — accounts here are
    // tutor-managed and no email infra is configured (RESEND_API_KEY is a
    // placeholder), so a confirmation link would never arrive.
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
    });
    if (error) return { error: `Could not update email: ${error.message}` };
  }

  await db.user.update({ where: { id: user.id }, data: { name, email } });

  revalidatePath("/", "layout");
  return {
    success:
      email !== user.email
        ? "Profile updated — use the new email next time you sign in."
        : "Profile updated.",
  };
}

export async function changePassword(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords don't match." };

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
  if (verifyError) return { error: "Current password is incorrect." };

  // Update through the session-bound client, not the admin API — the admin
  // route revokes every session for the user, including the one making this
  // very request (the action then dies mid-flight and the user is logged out).
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: `Could not change password: ${error.message}` };

  return { success: "Password changed." };
}
