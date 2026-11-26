import type { ReactNode } from "react";
import { LanguageToggle } from "./LanguageToggle";
import { Card } from "./Card";

/**
 * The frame for the small signed-out pages (join, reset, forgot): logo and
 * language switch above one card. Callers wrap it in a LanguageProvider.
 */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center bg-canvas px-4 py-10 sm:py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-card bg-brand text-xs font-bold tracking-tight text-white">AE</span>
            <span className="font-semibold tracking-tight text-ink">AmbaraEdu</span>
          </span>
          <LanguageToggle />
        </div>
        <Card padding="lg">{children}</Card>
      </div>
    </main>
  );
}
