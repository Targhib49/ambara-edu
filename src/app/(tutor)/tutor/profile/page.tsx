import { requireTutor } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProfileForms } from "@/components/ui/ProfileForms";

export default async function TutorProfilePage() {
  const tutor = await requireTutor();
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: t("nav.home"), href: "/tutor" }, { label: t("profile.title") }]} />
        <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
      </div>
      <ProfileForms name={tutor.name} email={tutor.email} />
    </div>
  );
}
