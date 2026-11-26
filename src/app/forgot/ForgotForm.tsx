"use client";

import { useActionState } from "react";
import { requestPasswordReset, type RequestResetState } from "@/lib/actions/invites";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/client";

export function ForgotForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState<RequestResetState, FormData>(requestPasswordReset, {});

  if (state.sent) return <Alert tone="success" className="mt-6">{t("forgot.sent")}</Alert>;

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field label={t("createStudent.email")} htmlFor="forgot-email">
        <Input id="forgot-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" disabled={pending} className="w-full py-2.5">
        {pending ? t("forgot.sending") : t("forgot.submit")}
      </Button>
    </form>
  );
}
