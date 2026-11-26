"use client";

import { useActionState, useState } from "react";
import { acceptInvite, type AcceptInviteState } from "@/lib/actions/invites";
import { useT } from "@/lib/i18n/client";

const fieldCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelCls = "mb-1.5 block text-sm font-medium text-zinc-700";

export function JoinForm({ token, defaultEmail }: { token: string; defaultEmail: string }) {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  // Controlled, because a form action resets uncontrolled fields after every
  // submit: a typo in the second password would otherwise wipe all three.
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState<AcceptInviteState, FormData>(
    acceptInvite.bind(null, token),
    {}
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="join-email" className={labelCls}>
          {t("createStudent.email")}
        </label>
        <input
          id="join-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldCls}
        />
        <p className="mt-1 text-xs text-zinc-500">{t("join.emailHint")}</p>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="join-password" className="block text-sm font-medium text-zinc-700">
            {t("join.password")}
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-xs font-medium text-blue-700 hover:underline"
          >
            {showPassword ? t("login.hidePassword") : t("login.showPassword")}
          </button>
        </div>
        <input
          id="join-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={t("profile.min8")}
          className={fieldCls}
        />
      </div>
      <div>
        <label htmlFor="join-confirm" className={labelCls}>
          {t("join.confirmPassword")}
        </label>
        <input
          id="join-confirm"
          name="confirmPassword"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldCls}
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? t("join.creating") : t("join.submit")}
      </button>
      <p className="text-center text-xs text-zinc-400">{t("join.afterwards")}</p>
    </form>
  );
}
