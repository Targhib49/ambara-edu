import type { ReactNode } from "react";

type AlertTone = "info" | "success" | "warning" | "danger";

const TONE: Record<AlertTone, string> = {
  info: "border-brand-line bg-brand-soft text-brand-ink",
  success: "border-success-line bg-success-wash text-success-ink",
  warning: "border-warning-line bg-warning-wash text-warning-ink",
  danger: "border-danger-line bg-danger-wash text-danger-ink",
};

/**
 * A message box for a form result or a page notice. Errors are announced to
 * screen readers as they appear; the calmer tones are polite.
 */
export function Alert({ tone = "info", className, children }: { tone?: AlertTone; className?: string; children: ReactNode }) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-control border px-3 py-2 text-sm ${TONE[tone]} ${className ?? ""}`}
    >
      {children}
    </p>
  );
}
