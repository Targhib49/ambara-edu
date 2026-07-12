import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProfileForms } from "@/components/ui/ProfileForms";

export default async function StudentProfilePage() {
  const student = await requireStudent();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tracks" }, { label: "Profile" }]} />
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>
      <ProfileForms name={student.name} email={student.email} />
    </div>
  );
}
