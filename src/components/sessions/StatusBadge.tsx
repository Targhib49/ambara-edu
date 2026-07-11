import type { SessionStatus } from "@/generated/prisma/enums";
import { SESSION_STATUS_BADGE_CLASS, SESSION_STATUS_LABEL } from "@/lib/sessions/format";

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_BADGE_CLASS[status]}`}>
      {SESSION_STATUS_LABEL[status]}
    </span>
  );
}
