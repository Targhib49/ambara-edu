import { requireTutor } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProfileForms } from "@/components/ui/ProfileForms";
import { FeatureFlagPanel } from "@/components/ui/FeatureFlagPanel";
import { getFlagStates } from "@/lib/flags";

export default async function TutorProfilePage() {
  const tutor = await requireTutor();
  const flagStates = await getFlagStates();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Profile" }]} />
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>
      <ProfileForms name={tutor.name} email={tutor.email} />
      <FeatureFlagPanel states={flagStates} />
    </div>
  );
}
