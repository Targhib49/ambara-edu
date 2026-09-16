import { requireTutor } from "@/lib/auth";
import { TutorSidebar } from "@/components/ui/TutorSidebar";
import { TutorTopBar } from "@/components/ui/TutorTopBar";
import { isEnabled } from "@/lib/flags";
import { getLanguage } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/client";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const tutor = await requireTutor();
  const playground = await isEnabled("playground");
  // Resolved once here so every client component in the shell reads the same one.
  const language = await getLanguage();
  return (
    <LanguageProvider language={language}>
      <div className="flex min-h-screen w-full flex-1">
        <TutorSidebar showPlayground={playground} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TutorTopBar userName={tutor.name} email={tutor.email} />
          <main className="flex-1 bg-zinc-50">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  );
}
