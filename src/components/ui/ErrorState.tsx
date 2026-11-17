"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n/client";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";

/**
 * The fallback every error boundary renders. Server-side errors reach the
 * browser with their message stripped and only a `digest` left, which is the
 * same id Next prints next to the full error in the server log — so it is
 * shown as a reference code a student can pass on.
 */
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-lg font-semibold text-zinc-900">{t("error.title")}</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">{t("error.body")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className={btnPrimary} onClick={() => retry()}>
          {t("error.retry")}
        </button>
        {/* A full page load on purpose: a soft navigation can land back in the same broken client state. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className={btnSecondary}>
          {t("error.home")}
        </a>
      </div>
      {digest && <p className="mt-6 font-mono text-xs text-zinc-400">{t("error.reference", { code: digest })}</p>}
    </div>
  );
}
