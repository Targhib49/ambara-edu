"use client";

import { useActionState } from "react";
import {
  updateProfile,
  changePassword,
  type ProfileState,
} from "@/lib/actions/profile";

const inputCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelCls = "block text-xs font-medium text-zinc-500";

// Shared by the tutor and student profile pages — both roles edit the same
// three things (name, email, password), so unlike the top bars there's real
// logic worth sharing here.
export function ProfileForms({ name, email }: { name: string; email: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AccountDetailsForm name={name} email={email} />
      <ChangePasswordForm />
    </div>
  );
}

function AccountDetailsForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {}
  );

  return (
    <form
      action={formAction}
      className="space-y-3 self-start rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-medium">Account details</h2>
      <div className="space-y-1">
        <label htmlFor="profile-name" className={labelCls}>
          Full name
        </label>
        <input
          id="profile-name"
          name="name"
          required
          defaultValue={name}
          className={inputCls}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="profile-email" className={labelCls}>
          Email
        </label>
        <input
          id="profile-email"
          name="email"
          type="email"
          required
          defaultValue={email}
          className={inputCls}
        />
        <p className="text-xs text-zinc-400">
          Changing this changes the email you sign in with — it takes effect immediately.
        </p>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    changePassword,
    {}
  );

  return (
    <form
      action={formAction}
      className="space-y-3 self-start rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-medium">Change password</h2>
      <div className="space-y-1">
        <label htmlFor="profile-current-password" className={labelCls}>
          Current password
        </label>
        <input
          id="profile-current-password"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputCls}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="profile-new-password" className={labelCls}>
          New password
        </label>
        <input
          id="profile-new-password"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Min 8 characters"
          className={inputCls}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="profile-confirm-password" className={labelCls}>
          Confirm new password
        </label>
        <input
          id="profile-confirm-password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
