import type { ReactNode } from "react";

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

export const BADGE_TONE: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-soft",
  brand: "bg-brand-soft text-brand-ink",
  success: "bg-success-soft text-success-ink",
  warning: "bg-warning-soft text-warning-ink",
  danger: "bg-danger-soft text-danger-ink",
};

/** A small rounded status label. */
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONE[tone]} ${className ?? ""}`}>
      {children}
    </span>
  );
}
