"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireTutor } from "@/lib/auth";
import { flagCookieName, isFeatureFlag } from "@/lib/flags";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Set (or clear) this browser's override for a flag. Tutor-only: the override
 * exists so v2 can be previewed against real content without exposing it to
 * the student.
 */
export async function setFeatureFlag(formData: FormData) {
  await requireTutor();

  const flag = String(formData.get("flag") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!isFeatureFlag(flag)) return;

  const jar = await cookies();
  if (value === "on" || value === "off") {
    jar.set(flagCookieName(flag), value, {
      maxAge: ONE_YEAR,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  } else {
    // "default" — fall back to whatever the environment says.
    jar.delete(flagCookieName(flag));
  }

  revalidatePath("/", "layout");
}
