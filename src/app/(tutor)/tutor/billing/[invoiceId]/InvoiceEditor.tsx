"use client";

import { useActionState, useState, useTransition } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import {
  addInvoiceItem,
  deleteInvoiceItem,
  deletePayment,
  recordPayment,
  setInvoiceStatus,
  updateInvoiceDetails,
  type BillingResult,
} from "@/lib/actions/billing";
import { formatIDR } from "@/lib/billing/money";
import { useT } from "@/lib/i18n/client";
import type { InvoiceStatus } from "@/generated/prisma/enums";

function Problem({ state }: { state: BillingResult }) {
  return state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null;
}

/** Send, settle or void — the one row of buttons that moves an invoice along. */
export function InvoiceActions({ invoiceId, number, status }: { invoiceId: string; number: string; status: InvoiceStatus }) {
  const t = useT();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (next: InvoiceStatus) =>
    start(async () => {
      const result = await setInvoiceStatus(invoiceId, next);
      setError(result.error ?? null);
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <button type="button" disabled={pending} onClick={() => run("SENT")} className={btnPrimary}>
            {t("invoice.send")}
          </button>
        )}
        {status === "SENT" && (
          <>
            <button type="button" disabled={pending} onClick={() => run("PAID")} className={btnPrimary}>
              {t("invoice.markPaid")}
            </button>
            <button type="button" disabled={pending} onClick={() => run("DRAFT")} className={btnSecondary}>
              {t("invoice.backToDraft")}
            </button>
          </>
        )}
        {status !== "VOID" && status !== "DRAFT" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm(t("invoice.voidConfirm", { number })) && run("VOID")}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {t("invoice.void")}
          </button>
        )}
      </div>
      {status === "DRAFT" && <p className={hintCls}>{t("invoice.sendHint")}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function AddItemForm({ invoiceId }: { invoiceId: string }) {
  const t = useT();
  const [state, action] = useActionState(addInvoiceItem, {} as BillingResult);
  return (
    <form action={action} className="space-y-3 rounded-xl border border-dashed border-zinc-300 p-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <p className="text-sm font-medium text-zinc-700">{t("invoice.addItem")}</p>
      <p className={hintCls}>{t("invoice.addItemHint")}</p>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_8rem_auto]">
        <input name="description" placeholder={t("invoice.description")} aria-label={t("invoice.description")} className={inputCls} />
        <input name="quantity" defaultValue={1} inputMode="numeric" aria-label={t("invoice.quantity")} className={inputCls} />
        <input name="unitAmount" placeholder="150000" inputMode="numeric" aria-label={t("invoice.unitAmount")} className={inputCls} />
        <SubmitButton pendingLabel={t("action.adding")} className={btnSecondary}>
          {t("action.add")}
        </SubmitButton>
      </div>
      <Problem state={state} />
    </form>
  );
}

export function RemoveItemButton({ itemId }: { itemId: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={t("invoice.removeItem")}
      title={t("invoice.removeItem")}
      onClick={() => start(async () => void (await deleteInvoiceItem(itemId)))}
      className="px-2 text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
    >
      ✕
    </button>
  );
}

export function InvoiceDetailsForm({ invoiceId, note, dueOn }: { invoiceId: string; note: string; dueOn: string }) {
  const t = useT();
  const [state, action] = useActionState(updateInvoiceDetails, {} as BillingResult);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div>
        <label className={labelCls} htmlFor="invoice-due">
          {t("invoice.dueOn")}
        </label>
        <input id="invoice-due" type="date" name="dueOn" defaultValue={dueOn} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="invoice-note">
          {t("invoice.note")}
        </label>
        <textarea id="invoice-note" name="note" rows={3} defaultValue={note} className={inputCls} />
        <p className={hintCls}>{t("invoice.noteHint")}</p>
      </div>
      <Problem state={state} />
      <SubmitButton pendingLabel={t("lessonEditor.updating")} className={btnSecondary}>
        {t("invoice.save")}
      </SubmitButton>
    </form>
  );
}

export function RecordPaymentForm({ invoiceId, remaining, today }: { invoiceId: string; remaining: number; today: string }) {
  const t = useT();
  const [state, action] = useActionState(recordPayment, {} as BillingResult);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="payment-amount">
            {t("invoice.amount")}
          </label>
          <input
            id="payment-amount"
            name="amount"
            inputMode="numeric"
            defaultValue={remaining > 0 ? remaining : ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="payment-date">
            {t("invoice.paidOn")}
          </label>
          <input id="payment-date" type="date" name="paidOn" defaultValue={today} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="payment-method">
          {t("invoice.method")}
        </label>
        <input id="payment-method" name="method" placeholder={t("invoice.methodPlaceholder")} className={inputCls} />
      </div>
      <Problem state={state} />
      <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
        {t("invoice.recordPayment")}
      </SubmitButton>
    </form>
  );
}

export function DeletePaymentButton({ paymentId, amount }: { paymentId: string; amount: number }) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={t("invoice.deletePayment")}
      title={t("invoice.deletePayment")}
      onClick={() =>
        confirm(t("invoice.deletePaymentConfirm", { amount: formatIDR(amount) })) &&
        start(async () => void (await deletePayment(paymentId)))
      }
      className="px-2 text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
    >
      ✕
    </button>
  );
}

/** The invoice as plain text, for pasting into WhatsApp — there's no email domain yet. */
export function CopyInvoiceButton({ text }: { text: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className={btnSecondary}
    >
      {copied ? t("invoice.copied") : t("invoice.copy")}
    </button>
  );
}
