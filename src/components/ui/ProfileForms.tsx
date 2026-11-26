"use client";

import { useActionState } from "react";
import { updateProfile, changePassword, type ProfileState } from "@/lib/actions/profile";
import { useT } from "@/lib/i18n/client";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { Card } from "./Card";
import { Field, Input } from "./Field";

// Shared by the tutor and student profile pages — both roles edit the same
// three things (name, email, password), so unlike the top bars there's real
// logic worth sharing here.
export function ProfileForms({ name, email }: { name: string; email: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-2">
      <AccountDetailsForm name={name} email={email} />
      <ChangePasswordForm />
    </div>
  );
}

function Result({ state }: { state: ProfileState }) {
  if (state.error) return <Alert tone="danger">{state.error}</Alert>;
  if (state.success) return <Alert tone="success">{state.success}</Alert>;
  return null;
}

function AccountDetailsForm({ name, email }: { name: string; email: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateProfile, {});

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <h2 className="font-medium text-ink">{t("profile.accountDetails")}</h2>
        <Field label={t("createStudent.fullName")} htmlFor="profile-name">
          <Input id="profile-name" name="name" required defaultValue={name} autoComplete="name" />
        </Field>
        <Field label={t("createStudent.email")} htmlFor="profile-email" hint={t("profile.emailHint")}>
          <Input id="profile-email" name="email" type="email" required defaultValue={email} autoComplete="email" />
        </Field>
        <Result state={state} />
        <Button type="submit" disabled={pending}>
          {pending ? t("action.saving") : t("courseEditor.saveChanges")}
        </Button>
      </form>
    </Card>
  );
}

function ChangePasswordForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(changePassword, {});

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <h2 className="font-medium text-ink">{t("profile.changePassword")}</h2>
        <Field label={t("profile.currentPassword")} htmlFor="profile-current-password">
          <Input id="profile-current-password" name="currentPassword" type="password" required autoComplete="current-password" />
        </Field>
        <Field label={t("profile.newPassword")} htmlFor="profile-new-password">
          <Input
            id="profile-new-password"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={t("profile.min8")}
          />
        </Field>
        <Field label={t("profile.confirmPassword")} htmlFor="profile-confirm-password">
          <Input id="profile-confirm-password" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Result state={state} />
        <Button type="submit" disabled={pending}>
          {pending ? t("profile.changing") : t("profile.changePassword")}
        </Button>
      </form>
    </Card>
  );
}
