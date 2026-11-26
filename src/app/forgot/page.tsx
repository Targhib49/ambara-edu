import Link from "next/link";
import { LanguageProvider } from "@/lib/i18n/client";
import { getLanguage, getT } from "@/lib/i18n/server";
import { isEmailConfigured } from "@/lib/email";
import { AuthCard } from "@/components/ui/AuthCard";
import { ForgotForm } from "./ForgotForm";

/**
 * "Forgot your password?" With mail set up, the person gets a reset link in
 * their inbox; without it there's nothing to send, so the page says to ask the
 * tutor, who can make one from the student's Account tab.
 */
export default async function ForgotPage() {
  const [t, language] = await Promise.all([getT(), getLanguage()]);
  const mail = isEmailConfigured();

  return (
    <LanguageProvider language={language}>
      <AuthCard>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{t("forgot.title")}</h1>
        <p className="mt-1.5 text-sm text-ink-subtle">{mail ? t("forgot.intro") : t("forgot.askTutor")}</p>
        {mail && <ForgotForm />}
        <Link href="/login" className="mt-6 inline-block text-sm text-brand-ink hover:underline">
          {t("forgot.back")}
        </Link>
      </AuthCard>
    </LanguageProvider>
  );
}
