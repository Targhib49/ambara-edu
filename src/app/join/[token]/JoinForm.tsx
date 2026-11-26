"use client";

import { useActionState, useState } from "react";
import { acceptInvite, type AcceptInviteState } from "@/lib/actions/invites";
import { btnPrimary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

export function JoinForm({ token, suggestedEmail }: { token: string; suggestedEmail: string }) {
  const t = useT();
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState<AcceptInviteState, FormData>(
    acceptInvite.bind(null, token),
    {}
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelCls} htmlFor="join-email">
          {t("createStudent.email")}
        </label>
        <input
          id="join-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email ?? suggestedEmail}
          placeholder="you@example.com"
          className={inputCls}
        />
        <p className={hintCls}>{t("join.emailHint")}</p>
      </div>
      <div>
        <label className={labelCls} htmlFor="join-password">
          {t("login.password")}
        </label>
        <input
          id="join-password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="join-confirm">
          {t("join.confirmPassword")}
        </label>
        <input
          id="join-confirm"
          name="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className={inputCls}
        />
        <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
          {t("login.showPassword")}
        </label>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button disabled={pending} className={`${btnPrimary} w-full py-2.5`}>
        {pending ? t("join.creating") : t("join.submit")}
      </button>
    </form>
  );
}
