"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { createInvoice, setBillingPlan, type BillingResult } from "@/lib/actions/billing";
import { BILLING_KINDS, billingKindKey } from "@/lib/billing/plan";
import { INVOICE_STATUS_BADGE, invoiceStatusKey } from "@/lib/billing/invoice";
import { formatIDR } from "@/lib/billing/money";
import { useT } from "@/lib/i18n/client";
import type { Translate } from "@/lib/i18n/translate";
import type { BillingKind, InvoiceStatus } from "@/generated/prisma/enums";

export type BillingRow = {
  id: string;
  name: string;
  email: string;
  /** Server-formatted: the plan in force today, or null when none is set. */
  planLabel: string | null;
  planKind: BillingKind | null;
  payer: string;
  /** Sessions marked done that no invoice covers yet. */
  uninvoiced: number;
  /** Sessions in the past still sitting at confirmed — they can't be invoiced until closed out. */
  unmarked: number;
  outstanding: number;
  lastInvoiceLabel: string | null;
};

export type InvoiceRow = {
  id: string;
  number: string;
  studentName: string;
  periodLabel: string;
  status: InvoiceStatus;
  total: number;
  outstanding: number;
};

const makeStudentColumns = (t: Translate): Column<BillingRow>[] => [
  {
    key: "name",
    header: t("billing.students"),
    sort: (r) => r.name.toLowerCase(),
    text: (r) => r.name,
    className: "min-w-[200px]",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(r.name)}`}>
          {initialsFor(r.name)}
        </span>
        <span className="min-w-0">
          <Link href={`/tutor/students/${r.id}`} className="block truncate font-medium text-zinc-900 hover:text-blue-700">
            {r.name}
          </Link>
          <span className="block truncate text-xs text-zinc-500">{r.planLabel ?? t("billing.plan.none")}</span>
        </span>
      </div>
    ),
  },
  {
    key: "sessions",
    header: t("nav.sessions"),
    sort: (r) => r.uninvoiced * 100 + r.unmarked,
    text: (r) => `${r.uninvoiced} / ${r.unmarked}`,
    hideBelow: "lg",
    className: "text-xs",
    cell: (r) => (
      <span className="block space-y-0.5">
        {r.uninvoiced > 0 && <span className="block text-zinc-700">{t("billing.uninvoiced", { n: r.uninvoiced })}</span>}
        {r.unmarked > 0 && <span className="block text-amber-700">{t("billing.unmarked", { n: r.unmarked })}</span>}
        {r.uninvoiced === 0 && r.unmarked === 0 && <span className="block text-zinc-400">—</span>}
      </span>
    ),
  },
  {
    key: "lastInvoice",
    header: t("billing.lastInvoice"),
    sort: (r) => r.lastInvoiceLabel ?? "",
    text: (r) => r.lastInvoiceLabel ?? "",
    hideBelow: "xl",
    className: "whitespace-nowrap text-xs text-zinc-500",
    cell: (r) => r.lastInvoiceLabel ?? "—",
  },
  {
    key: "outstanding",
    header: t("billing.outstanding"),
    align: "right",
    sort: (r) => r.outstanding,
    text: (r) => (r.outstanding > 0 ? String(r.outstanding) : ""),
    className: "whitespace-nowrap",
    cell: (r) =>
      r.outstanding > 0 ? (
        <span className="font-medium text-amber-700">{formatIDR(r.outstanding)}</span>
      ) : (
        <span className="text-zinc-400">—</span>
      ),
  },
];

const makeInvoiceColumns = (t: Translate): Column<InvoiceRow>[] => [
  {
    key: "number",
    header: t("billing.invoices"),
    sort: (r) => r.number,
    text: (r) => r.number,
    className: "min-w-[200px]",
    cell: (r) => (
      <Link href={`/tutor/billing/${r.id}`} className="block min-w-0">
        <span className="block truncate font-medium text-zinc-900">{r.studentName}</span>
        <span className="block truncate font-mono text-xs text-zinc-500">{r.number}</span>
      </Link>
    ),
  },
  {
    key: "period",
    header: t("billing.month"),
    sort: (r) => r.periodLabel,
    text: (r) => r.periodLabel,
    hideBelow: "lg",
    className: "whitespace-nowrap text-sm text-zinc-600",
    cell: (r) => r.periodLabel,
  },
  {
    key: "status",
    header: t("quizList.header.status"),
    sort: (r) => r.status,
    text: (r) => t(invoiceStatusKey(r.status)),
    cell: (r) => (
      <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_BADGE[r.status]}`}>
        {t(invoiceStatusKey(r.status))}
      </span>
    ),
  },
  {
    key: "total",
    header: t("invoice.total"),
    align: "right",
    sort: (r) => r.total,
    text: (r) => String(r.total),
    className: "whitespace-nowrap",
    cell: (r) => (
      <span className="block">
        <span className="block text-zinc-900">{formatIDR(r.total)}</span>
        {r.outstanding > 0 && r.status !== "VOID" && (
          <span className="block text-xs text-amber-700">{t("invoice.remaining")}: {formatIDR(r.outstanding)}</span>
        )}
      </span>
    ),
  },
];

const studentTabs = (t: Translate): Tab<BillingRow>[] => [
  { key: "all", label: t("status.all"), match: () => true },
  { key: "owing", label: t("billing.outstanding"), match: (r) => r.outstanding > 0 },
  { key: "toInvoice", label: t("billing.newInvoice"), match: (r) => r.uninvoiced > 0 },
];

export function BillingStudentsTable({ rows }: { rows: BillingRow[] }) {
  const t = useT();
  return (
    <DataTable
      rows={rows}
      columns={makeStudentColumns(t)}
      rowKey={(r) => r.id}
      tabs={studentTabs(t)}
      search={{ placeholder: t("billing.students"), of: (r) => `${r.name} ${r.email}` }}
      empty={{ title: t("billing.noStudents") }}
      exportName="billing-students"
    />
  );
}

export function InvoicesTable({ rows }: { rows: InvoiceRow[] }) {
  const t = useT();
  return (
    <DataTable
      rows={rows}
      columns={makeInvoiceColumns(t)}
      rowKey={(r) => r.id}
      tabs={[
        { key: "open", label: t("invoice.status.SENT"), match: (r) => r.status === "SENT" },
        { key: "draft", label: t("invoice.status.DRAFT"), match: (r) => r.status === "DRAFT" },
        { key: "all", label: t("status.all"), match: () => true },
      ]}
      initialTab="open"
      search={{ placeholder: t("billing.invoices"), of: (r) => `${r.studentName} ${r.number}` }}
      empty={{ title: t("billing.noInvoices") }}
      exportName="invoices"
    />
  );
}

/** Creates the month's draft, then goes straight to it for checking over. */
export function NewInvoiceForm({ students, defaultMonth }: { students: ComboOption[]; defaultMonth: string }) {
  const t = useT();
  const [state, action] = useActionState(createInvoice, {} as BillingResult);
  const router = useRouter();
  const invoiceId = state.ok ? state.invoiceId : undefined;
  // The draft is worth checking over before it goes out, so open it.
  useEffect(() => {
    if (invoiceId) router.push(`/tutor/billing/${invoiceId}`);
  }, [invoiceId, router]);
  return (
    <form action={action} className="space-y-4">
      <p className={hintCls}>{t("billing.newInvoiceHint")}</p>
      <div>
        <label className={labelCls}>{t("billing.students")}</label>
        <Combobox name="studentId" options={students} placeholder={t("action.pickStudent")} />
      </div>
      <div>
        <label className={labelCls} htmlFor="invoice-month">
          {t("billing.month")}
        </label>
        <input id="invoice-month" name="month" type="month" defaultValue={defaultMonth} className={inputCls} />
      </div>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
          {state.invoiceId && (
            <Link href={`/tutor/billing/${state.invoiceId}`} className="ml-2 font-medium underline">
              {t("billing.invoices")}
            </Link>
          )}
        </p>
      )}
      <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
        {t("billing.newInvoice")}
      </SubmitButton>
    </form>
  );
}

/** A new arrangement from a given day; the old one still prices older invoices. */
export function BillingPlanForm({
  students,
  studentId,
  defaultDate,
}: {
  students?: ComboOption[];
  studentId?: string;
  defaultDate: string;
}) {
  const t = useT();
  const [state, action] = useActionState(setBillingPlan, {} as BillingResult);
  const [kind, setKind] = useState<BillingKind>("PER_SESSION");
  const slideOver = useSlideOver();
  const done = state.ok === true;
  useEffect(() => {
    if (done) slideOver?.close();
  }, [done, slideOver]);

  return (
    <form action={action} className="space-y-4">
      {studentId ? (
        <input type="hidden" name="studentId" value={studentId} />
      ) : (
        <div>
          <label className={labelCls}>{t("billing.students")}</label>
          <Combobox name="studentId" options={students ?? []} placeholder={t("action.pickStudent")} />
        </div>
      )}

      <fieldset>
        <legend className={labelCls}>{t("billing.plan")}</legend>
        <div className="space-y-1.5">
          {BILLING_KINDS.map((k) => (
            <label key={k} className={`flex cursor-pointer gap-2 rounded-md border p-2.5 ${kind === k ? "border-blue-400 bg-blue-50/50" : "border-zinc-200"}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-900">{t(billingKindKey(k))}</span>
                <span className="block text-xs text-zinc-500">{t(`${billingKindKey(k)}.hint` as never)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {(kind === "PER_SESSION" || kind === "MONTHLY") && (
        <div>
          <label className={labelCls} htmlFor="plan-amount">
            {kind === "PER_SESSION" ? t("billing.plan.amountPerSession") : t("billing.plan.amountPerMonth")}
          </label>
          <input id="plan-amount" name="amount" inputMode="numeric" placeholder="150000" className={inputCls} />
        </div>
      )}

      {kind === "MONTHLY" && (
        <div>
          <label className={labelCls} htmlFor="plan-included">
            {t("billing.plan.included")}
          </label>
          <input id="plan-included" name="includedSessions" inputMode="numeric" placeholder="8" className={inputCls} />
          <p className={hintCls}>{t("billing.plan.includedHint")}</p>
        </div>
      )}

      {kind === "EXTERNAL" && (
        <div>
          <label className={labelCls} htmlFor="plan-payer">
            {t("billing.plan.payer")}
          </label>
          <input id="plan-payer" name="payer" placeholder="Superprof" className={inputCls} />
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="plan-start">
          {t("billing.plan.startsOn")}
        </label>
        <input id="plan-start" name="startsOn" type="date" defaultValue={defaultDate} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="plan-note">
          {t("billing.plan.note")}
        </label>
        <input id="plan-note" name="note" className={inputCls} />
      </div>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
        {t("billing.plan.set")}
      </SubmitButton>
    </form>
  );
}
