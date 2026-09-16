"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LANGUAGES, type Language } from "@/lib/i18n/messages";
import { LANGUAGE_COOKIE } from "@/lib/i18n/server";

/**
 * Saves the interface language on the account, so it follows the person to any
 * device, and mirrors it into a cookie so signed-out pages (the login screen)
 * come up in the same language.
 */
export async function setLanguage(language: Language) {
  if (!LANGUAGES.includes(language)) return;

  const user = await getCurrentUser();
  if (user) await db.user.update({ where: { id: user.id }, data: { language } });

  (await cookies()).set(LANGUAGE_COOKIE, language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
