import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { formatIDR } from "@/lib/billing/money";
import { INVOICE_STATUS_BADGE, invoiceStatusKey, invoiceTotal, paidTotal } from "@/lib/billing/invoice";
import { dateLabel, monthLabel } from "@/lib/billing/period";

/** One invoice as the student reads it: what it covers, what's been paid, what's left. */
export default async function StudentInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const student = await requireStudent();
  const { invoiceId } = await params;
  const t = await getT();
  const language = await getLanguage();

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: { orderBy: { order: "asc" } }, payments: { orderBy: { paidOn: "asc" } } },
  });
  // A draft is the tutor's working copy, and someone else's invoice is not this student's business.
  if (!invoice || invoice.studentId !== student.id || invoice.status === "DRAFT") notFound();

  const total = invoiceTotal(invoice.items);
  const paid = paidTotal(invoice.payments);
  const remaining = total - paid;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/" },
            { label: t("studentBilling.title"), href: "/billing" },
            { label: invoice.number },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{monthLabel(invoice.periodStart, language)}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_BADGE[invoice.status]}`}>
            {t(invoiceStatusKey(invoice.status))}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          {invoice.number}
          {invoice.dueOn && ` · ${t("invoice.due", { date: dateLabel(invoice.dueOn, language) })}`}
        </p>
      </div>

      <section className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2.5 text-zinc-700">
                  {item.description}
                  {item.quantity > 1 && <span className="text-zinc-400"> ×{item.quantity}</span>}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900">
                  {formatIDR(item.quantity * item.unitAmount, language)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-zinc-200 bg-zinc-50/60">
            <tr>
              <td className="px-4 py-2 text-right text-sm font-medium text-zinc-600">{t("invoice.total")}</td>
              <td className="px-4 py-2 text-right text-base font-semibold tabular-nums text-zinc-900">{formatIDR(total, language)}</td>
            </tr>
            {paid > 0 && (
              <tr>
                <td className="px-4 py-1 pb-3 text-right text-sm text-zinc-600">{t("invoice.remaining")}</td>
                <td className={`px-4 py-1 pb-3 text-right font-medium tabular-nums ${remaining > 0 ? "text-amber-700" : "text-green-700"}`}>
                  {formatIDR(remaining, language)}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </section>

      {invoice.note && <p className={`${cardCls} whitespace-pre-line p-4 text-sm text-zinc-700`}>{invoice.note}</p>}

      {invoice.payments.length > 0 && (
        <section className={`${cardCls} p-4`}>
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">{t("invoice.payments")}</h2>
          <ul className="divide-y divide-zinc-100 text-sm">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-zinc-600">
                  {dateLabel(p.paidOn, language)}
                  {p.method && ` · ${p.method}`}
                </span>
                <span className="tabular-nums text-zinc-900">{formatIDR(p.amount, language)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
