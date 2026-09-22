import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { formatIDR } from "@/lib/billing/money";
import { INVOICE_STATUS_BADGE, invoiceStatusKey, invoiceTotal, paidTotal } from "@/lib/billing/invoice";
import { dateInputValue, dateLabel, monthLabel, todayDate } from "@/lib/billing/period";
import { invoiceText } from "@/lib/billing/text";
import {
  AddItemForm,
  CopyInvoiceButton,
  DeletePaymentButton,
  InvoiceActions,
  InvoiceDetailsForm,
  RecordPaymentForm,
  RemoveItemButton,
} from "./InvoiceEditor";

/**
 * One invoice, as the tutor works on it: the lines it bills, what's been
 * paid, and the buttons that move it from draft to sent to settled. A paid
 * or void invoice is left read-only — the record of what was charged.
 */
export default async function InvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  await requireTutor();
  const { invoiceId } = await params;
  const t = await getT();
  const language = await getLanguage();

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      items: { orderBy: { order: "asc" } },
      payments: { orderBy: { paidOn: "asc" } },
    },
  });
  if (!invoice) notFound();

  const total = invoiceTotal(invoice.items);
  const paid = paidTotal(invoice.payments);
  const remaining = total - paid;
  const editable = invoice.status === "DRAFT" || invoice.status === "SENT";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/tutor" },
            { label: t("billing.title"), href: "/tutor/billing" },
            { label: invoice.number },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{t("invoice.title", { number: invoice.number })}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_BADGE[invoice.status]}`}>
            {t(invoiceStatusKey(invoice.status))}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          <Link href={`/tutor/students/${invoice.student.id}`} className="font-medium text-zinc-700 hover:text-blue-700">
            {invoice.student.name}
          </Link>{" "}
          · {t("invoice.period", { month: monthLabel(invoice.periodStart, language) })}
          {invoice.issuedAt && ` · ${t("invoice.issued", { date: dateLabel(invoice.issuedAt, language) })}`}
          {invoice.dueOn && ` · ${t("invoice.due", { date: dateLabel(invoice.dueOn, language) })}`}
        </p>
      </div>

      <section className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-2 font-medium">{t("invoice.description")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("invoice.quantity")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("invoice.unitAmount")}</th>
              <th className="px-4 py-2 text-right font-medium">{t("invoice.lineTotal")}</th>
              {editable && <th className="w-8" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2.5 text-zinc-800">{item.description}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-zinc-600">{item.quantity}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-zinc-600">{formatIDR(item.unitAmount, language)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900">{formatIDR(item.quantity * item.unitAmount, language)}</td>
                {editable && (
                  <td className="pr-2 text-right">
                    <RemoveItemButton itemId={item.id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-zinc-200 bg-zinc-50/60">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-zinc-600">
                {t("invoice.total")}
              </td>
              <td className="px-4 py-2 text-right text-base font-semibold tabular-nums text-zinc-900">{formatIDR(total, language)}</td>
              {editable && <td />}
            </tr>
            {paid > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="px-4 py-1 text-right text-sm text-zinc-600">
                    {t("invoice.paid")}
                  </td>
                  <td className="px-4 py-1 text-right tabular-nums text-green-700">{formatIDR(paid, language)}</td>
                  {editable && <td />}
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-1 pb-3 text-right text-sm text-zinc-600">
                    {t("invoice.remaining")}
                  </td>
                  <td className={`px-4 py-1 pb-3 text-right font-medium tabular-nums ${remaining > 0 ? "text-amber-700" : "text-green-700"}`}>
                    {formatIDR(remaining, language)}
                  </td>
                  {editable && <td />}
                </tr>
              </>
            )}
          </tfoot>
        </table>
      </section>

      {editable && <AddItemForm invoiceId={invoice.id} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${cardCls} space-y-3 p-4`}>
          <h2 className="text-sm font-semibold text-zinc-900">{t("invoice.payments")}</h2>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("invoice.noPayments")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {invoice.payments.map((p) => (
                <li key={p.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block text-zinc-900">{formatIDR(p.amount, language)}</span>
                    <span className="block text-xs text-zinc-500">
                      {dateLabel(p.paidOn, language)}
                      {p.method && ` · ${p.method}`}
                    </span>
                  </span>
                  {invoice.status !== "VOID" && <DeletePaymentButton paymentId={p.id} amount={p.amount} />}
                </li>
              ))}
            </ul>
          )}
          {invoice.status !== "VOID" && (
            <RecordPaymentForm invoiceId={invoice.id} remaining={remaining} today={dateInputValue(todayDate())} />
          )}
        </section>

        <section className={`${cardCls} space-y-4 p-4`}>
          {editable ? (
            <InvoiceDetailsForm
              invoiceId={invoice.id}
              note={invoice.note}
              dueOn={invoice.dueOn ? dateInputValue(invoice.dueOn) : ""}
            />
          ) : (
            invoice.note && <p className="whitespace-pre-line text-sm text-zinc-600">{invoice.note}</p>
          )}
          <InvoiceActions invoiceId={invoice.id} number={invoice.number} status={invoice.status} />
          <CopyInvoiceButton
            text={invoiceText(
              {
                number: invoice.number,
                studentName: invoice.student.name,
                periodLabel: monthLabel(invoice.periodStart, language),
                dueLabel: invoice.dueOn ? dateLabel(invoice.dueOn, language) : null,
                items: invoice.items,
                paid,
                note: invoice.note,
              },
              language
            )}
          />
        </section>
      </div>
    </div>
  );
}
