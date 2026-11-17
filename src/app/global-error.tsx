"use client";

import "./globals.css";
import { ErrorState } from "@/components/ui/ErrorState";

// Replaces the root layout when the root layout itself fails, so it has to
// bring its own <html>, <body> and stylesheet.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col bg-zinc-50">
        <title>AmbaraEdu</title>
        <ErrorState error={error} retry={retry} />
      </body>
    </html>
  );
}
