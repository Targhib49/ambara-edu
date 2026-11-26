import Link from "next/link";
import { db } from "@/lib/db";
import { hashInviteToken } from "@/lib/invites";
import { LanguageProvider } from "@/lib/i18n/client";
import { getLanguage, getT } from "@/lib/i18n/server";
import { AuthCard } from "@/components/ui/AuthCard";
import { ResetForm } from "./ResetForm";

/** Where a password-reset link lands. Looks the link up only; pressing the button spends it. */
export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [t, language] = await Promise.all([getT(), getLanguage()]);
  const link = await db.studentInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { user: { select: { name: true, email: true } } },
  });
  const isReset = link?.kind === "RESET";
  const usable = link && isReset && link.expiresAt > new Date();
  const expired = link && isReset && link.expiresAt <= new Date();

  return (
    <LanguageProvider language={language}>
      <AuthCard>
        {usable ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-ink">{t("reset.title")}</h1>
            <p className="mt-1.5 text-sm text-ink-subtle">{t("reset.intro", { email: link.user.email })}</p>
            <ResetForm token={token} email={link.user.email} />
          </>
        ) : (
          <div className="space-y-2 text-center">
            <h1 className="text-lg font-semibold text-ink">{expired ? t("join.expiredTitle") : t("join.invalidTitle")}</h1>
            <p className="text-sm text-ink-muted">{t("reset.deadBody")}</p>
            <div className="flex justify-center gap-4 pt-2 text-sm">
              <Link href="/forgot" className="text-brand-ink hover:underline">
                {t("reset.askAgain")}
              </Link>
              <Link href="/login" className="text-brand-ink hover:underline">
                {t("verify.goSignIn")}
              </Link>
            </div>
          </div>
        )}
      </AuthCard>
    </LanguageProvider>
  );
}
