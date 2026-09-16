"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, type Language } from "@/lib/i18n/messages";
import { makeT, type Translate } from "@/lib/i18n/translate";

const LanguageContext = createContext<Language>(DEFAULT_LANGUAGE);

/** Mounted by each shell layout with the language the server rendered in. */
export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

export function useT(): Translate {
  const language = useLanguage();
  return useMemo(() => makeT(language), [language]);
}
