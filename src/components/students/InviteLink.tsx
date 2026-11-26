"use client";

import { useState, useTransition } from "react";
import { newInviteLink, type InviteResult } from "@/lib/actions/students";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

/**
 * A freshly issued join link, with the two ways a tutor actually sends it.
 * Shown once: only a hash is stored, so losing it means issuing another.
 */
export function InviteLinkCard({ invite }: { invite: InviteResult }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const message = t("invite.whatsappText", { name: invite.name.split(" ")[0], link: invite.url });

  return (
    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
      <p className="text-sm font-medium text-zinc-900">{t("invite.sendTo", { name: invite.name })}</p>
      <input
        readOnly
        value={invite.url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={t("invite.linkLabel")}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-800"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard.writeText(invite.url).then(
              () => setCopied(true),
              () => setCopied(false)
            )
          }
          className={btnPrimary}
        >
          {copied ? t("calendarFeed.copied") : t("invite.copy")}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btnSecondary}
        >
          {t("invite.whatsapp")}
        </a>
      </div>
      <p className="text-xs text-zinc-600">
        {invite.emailedTo ? t("invite.emailed", { email: invite.emailedTo }) + " " : ""}
        {t("invite.validity")}
      </p>
    </div>
  );
}

/** "New link" for a student who hasn't joined: replaces (and so cancels) the old one. */
export function NewInviteLinkPanel({ studentId, name }: { studentId: string; name: string }) {
  const t = useT();
  const panel = useSlideOver();
  const [pending, startTransition] = useTransition();
  const [invite, setInvite] = useState<InviteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (invite) {
    return (
      <div className="space-y-4">
        <InviteLinkCard invite={invite} />
        <div className="flex justify-end border-t border-zinc-100 pt-4">
          <button type="button" onClick={panel?.close} className={btnSecondary}>
            {t("action.done")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">{t("invite.newIntro", { name })}</p>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await newInviteLink(studentId);
              if (result.error) setError(result.error);
              else if (result.invite) setInvite(result.invite);
            })
          }
          className={btnPrimary}
        >
          {pending ? t("invite.creating") : t("invite.newLink")}
        </button>
      </div>
    </div>
  );
}
