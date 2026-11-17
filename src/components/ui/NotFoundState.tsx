import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { btnPrimary } from "@/components/ui/styles";

/** What every not-found boundary renders; the caller supplies the surrounding frame. */
export async function NotFoundState() {
  const t = await getT();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-lg font-semibold text-zinc-900">{t("notFound.title")}</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">{t("notFound.body")}</p>
      <Link href="/" className={`mt-6 ${btnPrimary}`}>
        {t("error.home")}
      </Link>
    </div>
  );
}
