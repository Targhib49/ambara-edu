"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/Spinner";

// Submit button (for use inside a <form action={...}>) that asks for
// confirmation before submitting, then shows a spinner while the action runs.
export function ConfirmButton({
  children,
  message,
  className,
  pendingLabel = "Deleting…",
}: {
  children: ReactNode;
  message: string;
  className?: string;
  pendingLabel?: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
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
