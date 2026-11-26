import Link from "next/link";
import { db } from "@/lib/db";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { formatIDR } from "@/lib/billing/money";
import { INVOICE_STATUS_BADGE, invoiceStatusKey, invoiceTotal, isOwed, paidTotal } from "@/lib/billing/invoice";
import { dateLabel, monthLabel, todayDate } from "@/lib/billing/period";
import { planOn } from "@/lib/billing/plan";
import { creditTotal, sessionCredit } from "@/lib/billing/credit";
import { describePlan } from "@/lib/billing/text";

/** What a student owes, what's arranged, and what's paid. */
export async function loadBilling(studentId: string, viewer: "student" | "tutor") {
  const [invoices, plans, credits] = await Promise.all([
    db.invoice.findMany({
      // Drafts are the tutor's working copies; the student only sees what was sent.
      where: { studentId, ...(viewer === "student" ? { status: { not: "DRAFT" as const } } : {}) },
      orderBy: { periodStart: "desc" },
      include: { items: { orderBy: { order: "asc" } }, payments: { orderBy: { paidOn: "asc" } } },
    }),
    db.billingPlan.findMany({
      where: { studentId },
      orderBy: { startsOn: "asc" },
      include: { course: { select: { title: true } } },
    }),
    sessionCredit(studentId),
  ]);
  const owed = invoices
    .filter((i) => isOwed(i.status))
    .reduce((sum, i) => sum + Math.max(0, invoiceTotal(i.items) - paidTotal(i.payments)), 0);
  // One arrangement per subject: the latest that has started.
  const today = todayDate();
  const current = [...new Set(plans.map((p) => p.courseId))].flatMap((courseId) => {
    const plan = planOn(plans.filter((p) => p.courseId === courseId), today);
    return plan ? [plan] : [];
  });
  return { invoices, plans: current, credits, owed };
}

/**
 * The billing picture for one student, the same for both sides: the tutor's
 * copy also lists drafts and links into the invoice editor.
 */
export async function BillingOverview({ studentId, viewer }: { studentId: string; viewer: "student" | "tutor" }) {
  const t = await getT();
  const language = await getLanguage();
  const { invoices, plans, credits, owed } = await loadBilling(studentId, viewer);
  const external = plans.find((p) => p.kind === "EXTERNAL");
  const invoiceHref = (id: string) => (viewer === "tutor" ? `/tutor/billing/${id}` : `/billing/${id}`);

  return (
    <div className="space-y-4">
      {viewer === "student" && external && (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          {t("studentBilling.external", { payer: external.payer || t("billing.kind.EXTERNAL") })}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`${cardCls} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("studentBilling.owed")}</p>
          <p className={`mt-1 text-2xl font-semibold ${owed > 0 ? "text-amber-700" : "text-zinc-900"}`}>
            {owed > 0 ? formatIDR(owed, language) : t("studentBilling.settled")}
          </p>
        </div>
        <div className={`${cardCls} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("billing.plan")}</p>
          {plans.length === 0 ? (
            <p className="mt-1 text-sm text-zinc-500">{t("profile.noPlan")}</p>
          ) : (
            <ul className="mt-1 space-y-0.5">
              {plans.map((p) => (
                <li key={p.id} className="text-sm text-zinc-900">
                  {plans.length > 1 && (
                    <span className="text-zinc-500">{p.course?.title ?? t("billing.plan.anySubject")}: </span>
                  )}
                  {describePlan(t, language, p)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {credits.length > 0 && (
        <div className={`${cardCls} border-blue-200 bg-blue-50/60 p-4`}>
          <p className="font-medium text-blue-900">{t("studentBilling.credit", { n: creditTotal(credits) })}</p>
          <p className="mt-0.5 text-sm text-blue-900/80">
            {credits
              .map((c) => (c.subject ? t("billing.owesSubject", { subject: c.subject, n: c.sessions }) : t("billing.owes", { n: c.sessions })))
              .join(" · ")}
          </p>
          {viewer === "student" && (
            <>
              <p className="mt-1 text-sm text-blue-900/80">{t("studentBilling.creditHint")}</p>
              <Link href="/sessions" className="mt-1 inline-block text-sm font-medium text-blue-700 hover:underline">
                {t("studentBilling.book")}
              </Link>
            </>
          )}
        </div>
      )}

      {invoices.length === 0 ? (
        <p className={`${cardCls} p-6 text-center text-sm text-zinc-500`}>{viewer === "tutor" ? t("profile.noInvoices") : t("studentBilling.none")}</p>
      ) : (
        <ul className="space-y-3">
          {invoices.map((invoice) => {
            const total = invoiceTotal(invoice.items);
            const remaining = total - paidTotal(invoice.payments);
            return (
              <li key={invoice.id}>
                <Link href={invoiceHref(invoice.id)} className={`${cardCls} flex items-center gap-3 p-4 hover:border-zinc-300`}>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-zinc-900">{monthLabel(invoice.periodStart, language)}</span>
                    <span className="block truncate font-mono text-xs text-zinc-500">
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
