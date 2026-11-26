import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { getT } from "@/lib/i18n/server";
import { BillingOverview } from "@/components/profile/BillingOverview";

/**
 * What the student owes and what they've paid. The same view is the Billing
 * tab of their profile; this page stays as a shortcut from the sidebar.
 */
export default async function StudentBillingPage() {
  const student = await requireStudent();
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("studentBilling.title") }]}
        title={t("studentBilling.title")}
        meta={t("studentBilling.subtitle")}
      />
      <BillingOverview studentId={student.id} viewer="student" />
    </div>
  );
}
