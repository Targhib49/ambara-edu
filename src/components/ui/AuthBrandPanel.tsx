"use client";

import { useT } from "@/lib/i18n/client";

/**
 * The left half of the signed-out screens (sign in, join): the sidebar's slate,
 * so arriving already looks like the app.
 */
export function AuthBrandPanel() {
  const t = useT();
  const features = [t("login.feature1"), t("login.feature2"), t("login.feature3")];
  return (
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
          {features.map((feature) => (
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
  );
}
