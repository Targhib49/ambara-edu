"use client";

import { useState, useTransition } from "react";
import { newInviteLink, sendPasswordResetLink, type InviteResult } from "@/lib/actions/students";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import { Alert } from "@/components/ui/Alert";

/**
 * A freshly issued join link, with the two ways a tutor actually sends it.
 * Shown once: only a hash is stored, so losing it means issuing another.
 */
export function InviteLinkCard({ invite }: { invite: InviteResult }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const reset = invite.kind === "RESET";
  const first = invite.name.split(" ")[0];
  const message = reset
    ? t("resetLink.whatsappText", { name: first, link: invite.url })
    : t("invite.whatsappText", { name: first, link: invite.url });

  return (
    <div className="space-y-3 rounded-lg border border-brand-line bg-brand-soft/60 p-4">
      <p className="text-sm font-medium text-ink">{t("invite.sendTo", { name: invite.name })}</p>
      <input
        readOnly
        value={invite.url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={t("invite.linkLabel")}
        className="w-full rounded-control border border-line-strong bg-surface px-3 py-2 font-mono text-xs text-ink"
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
      <p className="text-xs text-ink-muted">
        {invite.emailedTo ? t("invite.emailed", { email: invite.emailedTo }) + " " : ""}
        {reset ? t("resetLink.validity") : t("invite.validity")}
      </p>
    </div>
  );
}

/** "New link" for a student who hasn't joined: replaces (and so cancels) the old one. */
export function NewInviteLinkPanel({ studentId, name }: { studentId: string; name: string }) {
  const t = useT();
  return (
    <IssueLinkPanel
      intro={t("invite.newIntro", { name })}
      buttonLabel={t("invite.newLink")}
      issue={() => newInviteLink(studentId)}
    />
  );
}

/** "Send reset link" for a student who has joined and forgotten their password. */
export function ResetLinkPanel({ studentId, name }: { studentId: string; name: string }) {
  const t = useT();
  return (
    <IssueLinkPanel
      intro={t("resetLink.intro", { name })}
      buttonLabel={t("resetLink.create")}
      issue={() => sendPasswordResetLink(studentId)}
    />
  );
}

function IssueLinkPanel({
  intro,
  buttonLabel,
  issue,
}: {
  intro: string;
  buttonLabel: string;
  issue: () => Promise<{ error?: string; invite?: InviteResult }>;
}) {
  const t = useT();
  const panel = useSlideOver();
  const [pending, startTransition] = useTransition();
  const [invite, setInvite] = useState<InviteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (invite) {
    return (
      <div className="space-y-4">
        <InviteLinkCard invite={invite} />
        <div className="flex justify-end border-t border-line-soft pt-4">
          <button type="button" onClick={panel?.close} className={btnSecondary}>
            {t("action.done")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{intro}</p>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
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
              const result = await issue();
              if (result.error) setError(result.error);
              else if (result.invite) setInvite(result.invite);
            })
          }
          className={btnPrimary}
        >
          {pending ? t("invite.creating") : buttonLabel}
        </button>
      </div>
    </div>
  );
}
