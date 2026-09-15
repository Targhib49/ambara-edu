"use client";

import { useLinkStatus } from "next/link";

/**
 * Put inside a <Link>: a fixed-size spinner that appears on the link you just
 * clicked while its page loads. Always rendered, so showing it never shifts
 * the layout.
 */
export function LinkPendingIndicator({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`inline-block h-3 w-3 shrink-0 rounded-full border-2 border-current border-r-transparent transition-opacity ${
        pending ? "animate-spin opacity-70" : "opacity-0"
      } ${className}`}
    />
  );
}
