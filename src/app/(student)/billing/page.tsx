import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { formatIDR } from "@/lib/billing/money";
import { INVOICE_STATUS_BADGE, invoiceStatusKey, invoiceTotal, isOwed, paidTotal } from "@/lib/billing/invoice";
import { dateLabel, monthLabel, todayDate } from "@/lib/billing/period";
import { planOn } from "@/lib/billing/plan";
import { creditTotal, sessionCredit } from "@/lib/billing/credit";

/**
 * What the student owes and what they've paid. Drafts are the tutor's own
 * working copies, so only invoices that have been sent appear here.
 */
export default async function StudentBillingPage() {
  const student = await requireStudent();
  const t = await getT();
  const language = await getLanguage();

  const [invoices, plans, credits] = await Promise.all([
    db.invoice.findMany({
      where: { studentId: student.id, status: { not: "DRAFT" } },
      orderBy: { periodStart: "desc" },
      include: { items: { orderBy: { order: "asc" } }, payments: { orderBy: { paidOn: "asc" } } },
    }),
    db.billingPlan.findMany({ where: { studentId: student.id }, orderBy: { startsOn: "asc" } }),
    sessionCredit(student.id),
  ]);

  const plan = planOn(plans, todayDate());
  const owed = invoices
    .filter((i) => isOwed(i.status))
    .reduce((sum, i) => sum + Math.max(0, invoiceTotal(i.items) - paidTotal(i.payments)), 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("studentBilling.title") }]}
        title={t("studentBilling.title")}
        meta={t("studentBilling.subtitle")}
      />

      {plan?.kind === "EXTERNAL" && (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          {t("studentBilling.external", { payer: plan.payer || t("billing.kind.EXTERNAL") })}
        </p>
      )}

      {credits.length > 0 && (
        <div className={`${cardCls} border-blue-200 bg-blue-50/60 p-4`}>
          <p className="font-medium text-blue-900">{t("studentBilling.credit", { n: creditTotal(credits) })}</p>
          <p className="mt-0.5 text-sm text-blue-900/80">
            {credits.map((c) => (c.subject ? t("billing.owesSubject", { subject: c.subject, n: c.sessions }) : t("billing.owes", { n: c.sessions }))).join(" · ")}
          </p>
          <p className="mt-1 text-sm text-blue-900/80">{t("studentBilling.creditHint")}</p>
          <Link href="/sessions" className="mt-1 inline-block text-sm font-medium text-blue-700 hover:underline">
            {t("studentBilling.book")}
          </Link>
        </div>
      )}

      <div className={`${cardCls} p-4`}>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("studentBilling.owed")}</p>
        <p className={`mt-1 text-2xl font-semibold ${owed > 0 ? "text-amber-700" : "text-zinc-900"}`}>
          {owed > 0 ? formatIDR(owed, language) : t("studentBilling.settled")}
        </p>
      </div>

      {invoices.length === 0 ? (
        <p className={`${cardCls} p-6 text-center text-sm text-zinc-500`}>{t("studentBilling.none")}</p>
      ) : (
        <ul className="space-y-3">
          {invoices.map((invoice) => {
            const total = invoiceTotal(invoice.items);
            const remaining = total - paidTotal(invoice.payments);
            return (
              <li key={invoice.id}>
                <Link href={`/billing/${invoice.id}`} className={`${cardCls} flex items-center gap-3 p-4 hover:border-zinc-300`}>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-zinc-900">{monthLabel(invoice.periodStart, language)}</span>
                    <span className="block font-mono text-xs text-zinc-500">
                      {invoice.number}
                      {invoice.dueOn && ` · ${t("invoice.due", { date: dateLabel(invoice.dueOn, language) })}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block tabular-nums text-zinc-900">{formatIDR(total, language)}</span>
                    {remaining > 0 && invoice.status === "SENT" && (
                      <span className="block text-xs text-amber-700">
                        {t("invoice.remaining")}: {formatIDR(remaining, language)}
                      </span>
                    )}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_BADGE[invoice.status]}`}>
                    {t(invoiceStatusKey(invoice.status))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
