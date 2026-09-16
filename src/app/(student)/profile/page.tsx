import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { getT } from "@/lib/i18n/server";
import { ProfileForms } from "@/components/ui/ProfileForms";
import { EmailVerificationCard } from "@/components/student/EmailVerificationCard";

export default async function StudentProfilePage() {
  const student = await requireStudent();
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <PageHeader crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("profile.title") }]} title={t("profile.title")} meta={student.email} />
      <ProfileForms name={student.name} email={student.email} />
      <EmailVerificationCard email={student.email} verified={student.emailVerifiedAt !== null} />
    </div>
  );
}
