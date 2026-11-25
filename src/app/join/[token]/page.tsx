import Link from "next/link";
import { lookupInvite } from "@/lib/invites";
import { isPlaceholderEmail } from "@/lib/students/inviteEmail";
import { getT } from "@/lib/i18n/server";
import { AuthBrandPanel } from "@/components/ui/AuthBrandPanel";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { JoinForm } from "./JoinForm";

export const metadata = { title: "Join AmbaraEdu" };

/**
 * Where an invite link lands. Only reads the link: it is spent when the
 * student presses the button, never by a mail scanner opening the page.
 */
export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getT();
  const invite = await lookupInvite(token);
  const firstName = invite.state === "ok" ? invite.name.split(/\s+/)[0] : "";

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-white lg:flex-row">
      <AuthBrandPanel />
      <section className="flex flex-1 items-start justify-center px-6 pb-10 pt-10 sm:px-10 sm:pt-14 lg:items-center lg:px-16 lg:py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>
          {invite.state === "ok" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{t("join.title", { name: firstName })}</h1>
              <p className="mt-1.5 text-sm text-zinc-500">{t("join.subtitle")}</p>
              <JoinForm token={token} defaultEmail={isPlaceholderEmail(invite.email) ? "" : invite.email} />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {invite.state === "used" ? t("join.usedTitle") : invite.state === "expired" ? t("join.expiredTitle") : t("join.invalidTitle")}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                {invite.state === "used" ? t("join.usedBody") : t("join.askTutor")}
              </p>
              <Link
                href="/login"
                className="mt-8 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                {t("verify.goSignIn")}
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
