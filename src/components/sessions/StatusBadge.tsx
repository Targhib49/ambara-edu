"use client";

import type { SessionStatus } from "@/generated/prisma/enums";
import { SESSION_STATUS_BADGE_CLASS, sessionStatusKey } from "@/lib/sessions/format";
import { useT } from "@/lib/i18n/client";

// A client component on purpose: it is rendered from both server pages and
// client tables, and translating itself keeps every call site unchanged.
export function StatusBadge({ status }: { status: SessionStatus }) {
  const t = useT();
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_BADGE_CLASS[status]}`}>
      {t(sessionStatusKey(status))}
    </span>
  );
}
