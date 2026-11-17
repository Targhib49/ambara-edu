"use client";

import { ErrorState } from "@/components/ui/ErrorState";

// Catches what the role boundaries can't: errors thrown by the role layouts
// themselves (their auth and language lookups) and by the pages outside them.
// No LanguageProvider is mounted this high, so the text is in the default language.
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-screen flex-1 bg-zinc-50">
      <ErrorState error={error} retry={retry} />
    </main>
  );
}
