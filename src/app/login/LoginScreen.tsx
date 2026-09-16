"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useT } from "@/lib/i18n/client";
import type { Translate } from "@/lib/i18n/translate";

const features = (t: Translate) => [t("login.feature1"), t("login.feature2"), t("login.feature3")];

/** Supabase's wording is accurate but reads like a system log. */
function friendlyError(t: Translate, message: string) {
  if (/invalid login credentials/i.test(message)) {
    return t("login.invalidCredentials");
  }
  return message;
}

export function LoginScreen() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(friendlyError(t, error.message));
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-white lg:flex-row">
      {/* Brand panel — the sidebar's slate, so signing in already looks like the app. */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-8 text-white sm:px-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[size:22px_22px]"
        />
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-bold tracking-tight shadow-lg shadow-blue-900/40">
            AE
          </span>
          <span className="text-lg font-semibold tracking-tight">AmbaraEdu</span>
        </div>

        <div className="relative mt-6 max-w-md lg:mt-0">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl lg:text-[2.6rem]">
            {t("login.tagline")}
          </h2>
          <ul className="mt-8 hidden space-y-3 lg:block">
            {features(t).map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-[15px] text-slate-300">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-300">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M5 10.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 hidden text-sm text-slate-400 lg:block">{t("login.footer")}</p>
      </section>

      {/* Form */}
      <section className="flex flex-1 items-start justify-center px-6 pb-10 pt-10 sm:px-10 sm:pt-14 lg:items-center lg:px-16 lg:py-10">
        <div className="w-full max-w-sm">
          {/* The switch is here too: the cookie it writes is what the signed-out pages read. */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{t("login.welcome")}</h1>
          <p className="mt-1.5 text-sm text-zinc-500">{t("login.subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                {t("createStudent.email")}
              </label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-zinc-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-zinc-400">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]" aria-hidden>
                    <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                    <path d="M3 5.5l7 5 7-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
                {t("login.password")}
              </label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-zinc-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-zinc-400">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]" aria-hidden>
                    <rect x="4" y="9" width="12" height="8.5" rx="2" />
                    <path d="M6.75 9V6.5a3.25 3.25 0 016.5 0V9" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  className="px-3 text-zinc-400 transition hover:text-zinc-700 focus-visible:text-zinc-700 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]" aria-hidden>
                      <path d="M3 3l14 14M8.3 8.4a2.5 2.5 0 003.4 3.4M6.1 6.2C4.2 7.3 2.9 9 2.5 10c.9 2.3 3.8 5.5 7.5 5.5 1.4 0 2.7-.4 3.8-1.1M9 4.6c.3 0 .7-.1 1-.1 3.7 0 6.6 3.2 7.5 5.5-.3.8-.9 1.8-1.7 2.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]" aria-hidden>
                      <path d="M2.5 10c.9-2.3 3.8-5.5 7.5-5.5s6.6 3.2 7.5 5.5c-.9 2.3-3.8 5.5-7.5 5.5S3.4 12.3 2.5 10z" strokeLinejoin="round" />
                      <circle cx="10" cy="10" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {pending && (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {pending ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-400">{t("login.forgot")}</p>
        </div>
      </section>
    </main>
  );
}
