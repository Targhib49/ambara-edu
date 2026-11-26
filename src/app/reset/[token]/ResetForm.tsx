"use client";

import { useActionState, useState } from "react";
import { acceptReset, type ResetPasswordLinkState } from "@/lib/actions/invites";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/client";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const t = useT();
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState<ResetPasswordLinkState, FormData>(acceptReset.bind(null, token), {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {/* Lets a password manager file the new password under the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <Field label={t("profile.newPassword")} htmlFor="reset-password">
        <Input id="reset-password" name="password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label={t("join.confirmPassword")} htmlFor="reset-confirm">
        <Input id="reset-confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} />
      </Field>
      <label className="flex items-center gap-2 text-xs text-ink-muted">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        {t("login.showPassword")}
      </label>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" disabled={pending} className="w-full py-2.5">
        {pending ? t("reset.saving") : t("reset.submit")}
      </Button>
    </form>
  );
}
