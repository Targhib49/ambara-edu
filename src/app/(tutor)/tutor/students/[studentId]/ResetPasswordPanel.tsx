"use client";

import { useState, useTransition } from "react";
import { resetStudentPassword } from "@/lib/actions/students";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, cardCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

/**
 * Lives in the "Reset password" panel on a student's page. The new password is
 * shown once, here — it is never stored in readable form, so closing the panel
 * without copying it means generating another.
 */
export function ResetPasswordPanel({ studentId, name }: { studentId: string; name: string }) {
  const t = useT();
  const panel = useSlideOver();
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = () =>
    startTransition(async () => {
      setError(null);
      const result = await resetStudentPassword(studentId);
      if (result.error) setError(result.error);
      else setPassword(result.password ?? null);
    });

  if (password) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">{t("resetPw.done", { name })}</p>
        <div className={`${cardCls} flex items-center gap-3 p-4`}>
          <code className="min-w-0 flex-1 break-all font-mono text-lg text-zinc-900">{password}</code>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(password).then(
                () => setCopied(true),
                () => setCopied(false)
              );
            }}
            className={btnSecondary}
          >
            {copied ? t("calendarFeed.copied") : t("calendarFeed.copy")}
          </button>
        </div>
        <p className="text-xs text-zinc-500">{t("resetPw.signedOut", { name })}</p>
        <div className="flex justify-end border-t border-zinc-100 pt-4">
          <button onClick={panel?.close} className={btnPrimary}>
            {t("action.done")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">{t("resetPw.intro", { name })}</p>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button onClick={run} disabled={pending} className={btnPrimary}>
          {pending ? t("resetPw.resetting") : t("studentPage.resetPassword")}
        </button>
      </div>
    </div>
  );
}
