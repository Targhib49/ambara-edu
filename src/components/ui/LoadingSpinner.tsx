"use client";

import { useT } from "@/lib/i18n/client";

/**
 * Shared loading indicator for route-level loading.tsx boundaries. The
 * animation is CSS-only, so it keeps spinning even while the network is
 * stalled. A client component on purpose: loading boundaries must render
 * instantly, so it reads the language from the shell's provider rather than
 * looking up the user — and the root boundary, above both shells, falls back
 * to Indonesian.
 */
export function LoadingSpinner({ label }: { label?: string }) {
  const t = useT();
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-zinc-200 border-t-blue-600"
      />
      <p className="text-sm text-zinc-500">{label ?? t("loading.label")}</p>
    </div>
  );
}
