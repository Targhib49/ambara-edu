import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "@/lib/i18n/messages";
import { makeT, type Translate } from "@/lib/i18n/translate";

export const LANGUAGE_COOKIE = "lang";

/**
 * The language to render in: the signed-in person's saved choice, else the
 * cookie left by the switch (so the login page follows it too), else
 * Indonesian. Cached per request — every page and layout asks for it.
 */
export const getLanguage = cache(async (): Promise<Language> => {
  const user = await getCurrentUser();
  if (user) return user.language;
  const cookie = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  return LANGUAGES.find((l) => l === cookie) ?? DEFAULT_LANGUAGE;
});

export const getT = cache(async (): Promise<Translate> => makeT(await getLanguage()));
