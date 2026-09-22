import type { InvoiceStatus } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";

export type ItemLike = { quantity: number; unitAmount: number };
export type PaymentLike = { amount: number };

/** What the invoice asks for: every line, quantity times price. */
export function invoiceTotal(items: ItemLike[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitAmount, 0);
}

export function paidTotal(payments: PaymentLike[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

/** Still owed on this invoice; negative means it was overpaid. */
export function outstanding(items: ItemLike[], payments: PaymentLike[]): number {
  return invoiceTotal(items) - paidTotal(payments);
}

/**
 * An invoice counts against the student while it's been sent and isn't
 * settled. A draft is the tutor's own working copy, and a void one never
 * happened.
 */
export function isOwed(status: InvoiceStatus): boolean {
  return status === "SENT";
}

export const invoiceStatusKey = (status: InvoiceStatus) => `invoice.status.${status}` as MessageKey;

export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  SENT: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-700",
  VOID: "bg-zinc-100 text-zinc-400 line-through",
};

/**
 * INV-2026-09-0001 — the month it bills, then a counter within that month.
 * Readable in a bank transfer note, and sorts by period.
 */
export function invoiceNumber(year: number, month: number, sequence: number): string {
  return `INV-${year}-${String(month).padStart(2, "0")}-${String(sequence).padStart(4, "0")}`;
}
