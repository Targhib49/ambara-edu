import Link from "next/link";
import { db } from "@/lib/db";
import { hashInviteToken } from "@/lib/invites";
import { isPlaceholderEmail } from "@/lib/students/placeholder";
import { LanguageProvider } from "@/lib/i18n/client";
import { getLanguage, getT } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { cardCls } from "@/components/ui/styles";
import { JoinForm } from "./JoinForm";

/**
 * Where a student's invite link lands. Only looks the invite up — nothing is
 * spent until they press the button (see acceptInvite). Sits outside both
 * shells, so it provides the language itself, like the login page.
 */
export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [t, language] = await Promise.all([getT(), getLanguage()]);
  const invite = await db.studentInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { user: { select: { name: true, email: true } } },
  });
  const usable = invite && invite.expiresAt > new Date() && isPlaceholderEmail(invite.user.email);
  const expired = invite && invite.expiresAt <= new Date();

  return (
    <LanguageProvider language={language}>
      <main className="flex min-h-screen flex-1 flex-col items-center bg-surface-muted px-4 py-10 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-card bg-brand text-xs font-bold tracking-tight text-white">AE</span>
              <span className="font-semibold tracking-tight text-ink">AmbaraEdu</span>
            </span>
            <LanguageToggle />
          </div>

          <div className={`${cardCls} p-6 sm:p-8`}>
            {usable ? (
              <>
                <h1 className="text-xl font-semibold tracking-tight text-ink">
                  {t("join.greeting", { name: invite.user.name.split(" ")[0] })}
                </h1>
                <p className="mt-1.5 text-sm text-ink-subtle">{t("join.intro")}</p>
                <JoinForm token={token} suggestedEmail={invite.suggestedEmail ?? ""} />
              </>
            ) : (
              <div className="space-y-2 text-center">
                <h1 className="text-lg font-semibold text-ink">
                  {expired ? t("join.expiredTitle") : t("join.invalidTitle")}
                </h1>
                <p className="text-sm text-ink-muted">{expired ? t("join.expiredBody") : t("join.invalidBody")}</p>
                <Link href="/login" className="inline-block pt-2 text-sm text-brand-ink hover:underline">
                  {t("verify.goSignIn")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </LanguageProvider>
  );
}
