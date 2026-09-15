"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Submit button for server-action forms: disables itself and shows a spinner
 * with a pending label while the action runs, so every mutation shows
 * progress even on a slow connection. Must be rendered inside the <form>.
 * Pass an empty pendingLabel for icon-sized buttons (↑ ↓) to show just the spinner.
 */
export function SubmitButton({
  children,
  pendingLabel = "Working…",
  className,
  disabled,
  title,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  pendingLabel?: ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      aria-label={ariaLabel}
      title={title}
      className={className}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-1.5">
          <Spinner />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
