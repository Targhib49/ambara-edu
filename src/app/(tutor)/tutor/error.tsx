"use client";

import { ErrorState } from "@/components/ui/ErrorState";

// Sits inside the role layout, so the sidebar and top bar stay usable when a
// page underneath them throws.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorState error={error} retry={retry} />;
}
