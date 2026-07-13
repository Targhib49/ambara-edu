"use client";

import { useFormStatus } from "react-dom";

// Submit button (for use inside a <form action={...}>) that asks for
// confirmation before submitting, then shows a pending state while the
// action runs.
export function ConfirmButton({
  children,
  message,
  className,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Deleting…" : children}
    </button>
  );
}
