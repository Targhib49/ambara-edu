import Link from "next/link";
import { db } from "@/lib/db";
import { confirmEmail } from "@/lib/actions/verification";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, cardCls } from "@/components/ui/styles";
import { getT } from "@/lib/i18n/server";

type State = "confirmed" | "expired" | "invalid";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; state?: string }>;
}) {
  const t = await getT();
  const { token, state } = await searchParams;
  const settled = (["confirmed", "expired", "invalid"] as const).find((s) => s === state) ?? null;

  // Only looked up, never spent, until the student presses the button.
  const record = !settled && token ? await db.emailVerificationToken.findUnique({ where: { token } }) : null;
  const status: State | null = settled ?? (!token || !record ? "invalid" : record.expiresAt < new Date() ? "expired" : null);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className={`${cardCls} w-full max-w-sm space-y-4 p-8 text-center`}>
        {status === null && token && (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">{t("verify.confirmTitle")}</h1>
            <p className="text-sm text-zinc-600">{t("verify.confirmBody")}</p>
            <form action={confirmEmail.bind(null, token)}>
              <SubmitButton pendingLabel={t("verify.confirming")} className={btnPrimary}>
                {t("verify.confirmButton")}
              </SubmitButton>
            </form>
          </>
        )}
        {status === "confirmed" && (
          <>
            <h1 className="text-lg font-semibold text-green-700">{t("verify.confirmedTitle")}</h1>
            <p className="text-sm text-zinc-600">{t("verify.confirmedBody")}</p>
          </>
        )}
        {status === "expired" && (
          <>
            <h1 className="text-lg font-semibold text-amber-700">{t("verify.expiredTitle")}</h1>
            <p className="text-sm text-zinc-600">{t("verify.expiredBody")}</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <h1 className="text-lg font-semibold text-red-600">{t("verify.invalidTitle")}</h1>
            <p className="text-sm text-zinc-600">{t("verify.invalidBody")}</p>
          </>
        )}
        <Link href="/login" className="inline-block text-sm text-blue-700 hover:underline">
          {t("verify.goSignIn")}
        </Link>
      </div>
    </main>
  );
}
