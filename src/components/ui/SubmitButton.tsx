"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button for server-action forms: disables itself and swaps to a
 * pending label while the action runs, so every mutation shows *some*
 * progress even on a slow connection. Must be rendered inside the <form>.
 */
export function SubmitButton({
  children,
  pendingLabel = "Working…",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
