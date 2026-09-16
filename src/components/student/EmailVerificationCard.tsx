"use client";

import { useState, useTransition } from "react";
import { resendMyVerificationEmail } from "@/lib/actions/verification";
import { btnSecondary, cardCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

/** On the student's profile: whether their address is confirmed, and a way to ask again. */
export function EmailVerificationCard({ email, verified }: { email: string; verified: boolean }) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className={`${cardCls} p-5`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-medium text-zinc-900">{t("emailCard.title")}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {verified ? t("emailCard.confirmed") : t("emailCard.notConfirmed")}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        {verified ? t("emailCard.verifiedBody", { email }) : t("emailCard.pendingBody", { email })}
      </p>
      {!verified && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await resendMyVerificationEmail();
                setMessage(result.error ?? result.success ?? null);
              })
            }
            className={btnSecondary}
          >
            {pending ? t("emailCard.sending") : t("emailCard.resend")}
          </button>
          {message && <span className="text-sm text-zinc-600">{message}</span>}
        </div>
      )}
    </section>
  );
}
