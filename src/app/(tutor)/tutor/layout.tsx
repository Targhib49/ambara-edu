import { requireTutor } from "@/lib/auth";
import { TutorSidebar } from "@/components/ui/TutorSidebar";
import { TutorTopBar } from "@/components/ui/TutorTopBar";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const tutor = await requireTutor();
  return (
    <div className="flex min-h-screen w-full flex-1">
      <TutorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TutorTopBar userName={tutor.name} />
        <main className="flex-1 bg-zinc-50">{children}</main>
      </div>
    </div>
  );
}
