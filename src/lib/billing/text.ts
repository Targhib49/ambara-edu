import { formatIDR } from "./money";
import { invoiceTotal, type ItemLike } from "./invoice";
import { makeT, type Translate } from "@/lib/i18n/translate";
import type { Language } from "@/lib/i18n/messages";

export type InvoiceTextInput = {
  number: string;
  studentName: string;
  periodLabel: string;
  dueLabel: string | null;
  items: (ItemLike & { description: string })[];
  paid: number;
  note: string;
};

/**
 * The invoice as plain text, for pasting into a WhatsApp message. Email is
 * boxed until there's a sending domain, and a message the tutor sends by hand
 * is what students already expect.
 */
export function invoiceText(invoice: InvoiceTextInput, language: Language = "ID"): string {
  const t = makeT(language);
  const money = (n: number) => formatIDR(n, language);
  const total = invoiceTotal(invoice.items);
  const lines = [
    `${t("invoice.title", { number: invoice.number })} — ${invoice.periodLabel}`,
    `${t("invoice.for")}: ${invoice.studentName}`,
    "",
    ...invoice.items.map((i) => `• ${i.description}${i.quantity > 1 ? ` ×${i.quantity}` : ""} — ${money(i.quantity * i.unitAmount)}`),
    "",
    `${t("invoice.total")}: ${money(total)}`,
  ];
  if (invoice.paid > 0) {
    lines.push(`${t("invoice.paid")}: ${money(invoice.paid)}`, `${t("invoice.remaining")}: ${money(total - invoice.paid)}`);
  }
  if (invoice.dueLabel) lines.push(t("invoice.due", { date: invoice.dueLabel }));
  if (invoice.note.trim()) lines.push("", invoice.note.trim());
  return lines.join("\n");
}

/** One line for an arrangement, as both the billing list and a student's profile show it. */
export function describePlan(
  t: Translate,
  language: Language,
  plan: { kind: string; amount: number; includedSessions: number | null; payer: string }
): string {
  return plan.kind === "PER_SESSION"
    ? t("billing.plan.perSession", { amount: formatIDR(plan.amount, language) })
    : plan.kind === "MONTHLY"
      ? t("billing.plan.perMonth", { amount: formatIDR(plan.amount, language) }) +
        (plan.includedSessions ? ` · ${t("billing.plan.includedCount", { n: plan.includedSessions })}` : "")
      : plan.kind === "EXTERNAL"
        ? `${t("billing.kind.EXTERNAL")}${plan.payer ? `: ${plan.payer}` : ""}`
        : t("billing.kind.FREE");
}
