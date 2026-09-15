import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForms } from "@/components/ui/ProfileForms";

export default async function StudentProfilePage() {
  const student = await requireStudent();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <PageHeader crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Profile" }]} title="Profile" meta={student.email} />
      <ProfileForms name={student.name} email={student.email} />
    </div>
  );
}
