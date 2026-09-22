import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { nowMs } from "@/lib/sessions/format";
import { studentOptions } from "@/lib/students/options";
import { courseOptions } from "@/lib/courses/options";
import { sessionCredit } from "@/lib/billing/credit";
import { formatIDR } from "@/lib/billing/money";
import { planOn } from "@/lib/billing/plan";
import { invoiceTotal, isOwed, outstanding, paidTotal } from "@/lib/billing/invoice";
import { currentMonth, dateInputValue, monthLabel, todayDate } from "@/lib/billing/period";
import { BillingPlanForm, BillingStudentsTable, InvoicesTable, NewInvoiceForm, type BillingRow, type InvoiceRow } from "./billing-ui";

/**
 * Where the money lives: what each student's arrangement is, what they owe,
 * and every invoice raised. Sessions become money only once they're marked
 * done, so the sessions still waiting to be closed out are shown here too —
 * they're the usual reason a month looks emptier than it was.
 */
export default async function TutorBillingPage() {
  await requireTutor();
  const t = await getT();
  const language = await getLanguage();
  const today = todayDate();
  const now = new Date(nowMs());

  const [students, invoices, options, courses] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        billingPlans: { orderBy: { startsOn: "asc" }, include: { course: { select: { title: true } } } },
        sessionsAsStudent: {
          where: { OR: [{ status: "COMPLETED", invoiceItem: null }, { status: "CONFIRMED", startTime: { lt: now } }] },
          select: { status: true },
        },
        invoices: {
          orderBy: { periodStart: "desc" },
          select: { id: true, periodStart: true, status: true, items: true, payments: { select: { amount: true } } },
        },
      },
    }),
    db.invoice.findMany({
      orderBy: [{ periodStart: "desc" }, { number: "desc" }],
      select: {
        id: true,
        number: true,
        periodStart: true,
        status: true,
        student: { select: { name: true } },
        items: true,
        payments: { select: { amount: true } },
      },
    }),
    studentOptions(),
    courseOptions(),
  ]);

  const describePlan = (plan: { kind: string; amount: number; includedSessions: number | null; payer: string }) =>
    plan.kind === "PER_SESSION"
      ? t("billing.plan.perSession", { amount: formatIDR(plan.amount, language) })
      : plan.kind === "MONTHLY"
        ? t("billing.plan.perMonth", { amount: formatIDR(plan.amount, language) }) +
          (plan.includedSessions ? ` · ${t("billing.plan.includedCount", { n: plan.includedSessions })}` : "")
        : plan.kind === "EXTERNAL"
          ? `${t("billing.kind.EXTERNAL")}${plan.payer ? `: ${plan.payer}` : ""}`
          : t("billing.kind.FREE");

  const credits = new Map(await Promise.all(students.map(async (s) => [s.id, await sessionCredit(s.id)] as const)));

  const rows: BillingRow[] = students.map((s) => {
    // One arrangement per subject, each the latest that has started.
    const subjects = [...new Set(s.billingPlans.map((p) => p.courseId))];
    const plans = subjects.flatMap((courseId) => {
      const plan = planOn(s.billingPlans.filter((p) => p.courseId === courseId), today);
      if (!plan) return [];
      return [{ subject: plan.course?.title ?? t("billing.plan.anySubject"), label: describePlan(plan) }];
    });
    const owed = s.invoices
      .filter((i) => isOwed(i.status))
      .reduce((sum, i) => sum + Math.max(0, outstanding(i.items, i.payments)), 0);
    const last = s.invoices[0];
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      plans,
      uninvoiced: s.sessionsAsStudent.filter((x) => x.status === "COMPLETED").length,
      unmarked: s.sessionsAsStudent.filter((x) => x.status === "CONFIRMED").length,
      outstanding: owed,
      owedSessions: (credits.get(s.id) ?? []).map((c) => ({ subject: c.subject, sessions: c.sessions })),
      lastInvoiceLabel: last ? `${monthLabel(last.periodStart, language)} · ${t(`invoice.status.${last.status}` as never)}` : null,
    };
  });

  const invoiceRows: InvoiceRow[] = invoices.map((i) => ({
    id: i.id,
    number: i.number,
    studentName: i.student.name,
    periodLabel: monthLabel(i.periodStart, language),
    status: i.status,
    total: invoiceTotal(i.items),
    outstanding: invoiceTotal(i.items) - paidTotal(i.payments),
  }));

  const totalOwed = rows.reduce((sum, r) => sum + r.outstanding, 0);
  const unmarkedTotal = rows.reduce((sum, r) => sum + r.unmarked, 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("billing.title") }]}
        title={t("billing.title")}
        meta={t("billing.subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <a href="/tutor/sessions/subjects" className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              {t("subjects.link")}
            </a>
            <SlideOverButton label={t("billing.plan.set")} title={t("billing.plan.set")} variant="secondary" icon="none">
              <BillingPlanForm students={options} courses={courses} defaultDate={dateInputValue(today)} />
            </SlideOverButton>
            <SlideOverButton label={t("billing.newInvoice")} title={t("billing.newInvoice")}>
              <NewInvoiceForm students={options} defaultMonth={currentMonth()} />
            </SlideOverButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`${cardCls} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("billing.totalOutstanding")}</p>
          <p className={`mt-1 text-2xl font-semibold ${totalOwed > 0 ? "text-amber-700" : "text-zinc-900"}`}>
            {totalOwed > 0 ? formatIDR(totalOwed, language) : t("billing.allSettled")}
          </p>
        </div>
        {unmarkedTotal > 0 && (
          <div className={`${cardCls} border-amber-200 bg-amber-50/60 p-4`}>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">{t("billing.unmarked", { n: unmarkedTotal })}</p>
            <p className="mt-1 text-sm text-amber-900">{t("billing.unmarkedHint")}</p>
            <a href="/tutor/sessions" className="mt-1 inline-block text-sm font-medium text-amber-900 underline">
              {t("nav.sessions")} →
            </a>
          </div>
        )}
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t("billing.students")}</h2>
        <BillingStudentsTable rows={rows} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t("billing.invoices")}</h2>
        <InvoicesTable rows={invoiceRows} />
      </section>
    </div>
  );
}
