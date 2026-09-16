"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/lib/actions/language";
import { LANGUAGES, LANGUAGE_LABEL, type Language } from "@/lib/i18n/messages";
import { useLanguage, useT } from "@/lib/i18n/client";

/** ID / EN switch in the top bar. The choice is saved on the account. */
export function LanguageToggle() {
  const current = useLanguage();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language.switchTo", { language: current === "ID" ? "English" : "Bahasa Indonesia" })}
      className="inline-flex overflow-hidden rounded-md border border-zinc-300 bg-white"
    >
      {LANGUAGES.map((language: Language) => {
        const active = language === current;
        return (
          <button
            key={language}
            type="button"
            aria-pressed={active}
            disabled={pending || active}
            onClick={() =>
              startTransition(async () => {
                await setLanguage(language);
                // The shell's language comes from the layout, which the client
                // keeps until it re-renders — refresh so the switch takes hold
                // here rather than at the next navigation.
                router.refresh();
              })
            }
            className={`px-2 py-1 text-xs font-semibold transition-colors ${
              active ? "bg-slate-900 text-white" : "text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
            }`}
          >
            {LANGUAGE_LABEL[language]}
          </button>
        );
      })}
    </div>
  );
}
