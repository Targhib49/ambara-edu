"use client";

import { useState, useTransition } from "react";
import { createInviteLink } from "@/lib/actions/students";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, cardCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

/**
 * The link itself, ready to hand over. Shown once: only a hash is stored, so
 * a lost link is replaced with a new one rather than looked up again.
 */
export function InviteLinkCard({ url, name }: { url: string; name: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const message = t("invite.shareMessage", { name: name.split(/\s+/)[0], url });

  return (
    <div className="space-y-3">
      <div className={`${cardCls} space-y-3 p-4`}>
        <p className="break-all font-mono text-sm text-zinc-900">{url}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(url).then(
                () => setCopied(true),
                () => setCopied(false)
              );
            }}
            className={btnPrimary}
          >
            {copied ? t("calendarFeed.copied") : t("invite.copyLink")}
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
      </div>
      <p className="text-xs text-zinc-500">{t("invite.linkNote")}</p>
    </div>
  );
}

/** The "Invite link" panel on a student's page, for someone who hasn't joined yet. */
export function InviteLinkPanel({ studentId, name }: { studentId: string; name: string }) {
  const t = useT();
  const panel = useSlideOver();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (url) {
    return (
      <div className="space-y-4">
        <InviteLinkCard url={url} name={name} />
        <div className="flex justify-end border-t border-zinc-100 pt-4">
          <button onClick={panel?.close} className={btnSecondary}>
            {t("action.done")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">{t("invite.newLinkIntro", { name })}</p>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button
          disabled={pending}
          className={btnPrimary}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await createInviteLink(studentId);
              if (result.error) setError(result.error);
              else setUrl(result.url ?? null);
            })
          }
        >
          {pending ? t("invite.making") : t("invite.makeLink")}
        </button>
      </div>
    </div>
  );
}
