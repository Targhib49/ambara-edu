import { requireStudent } from "@/lib/auth";
import { StudentSidebar } from "@/components/ui/StudentSidebar";
import { StudentTopBar } from "@/components/ui/StudentTopBar";
import { isEnabled } from "@/lib/flags";
import { getLanguage } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/client";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent();
  const playground = await isEnabled("playground");
  // Resolved once here so every client component in the shell reads the same one.
  const language = await getLanguage();
  return (
    <LanguageProvider language={language}>
      <div className="flex min-h-screen w-full flex-1">
        <StudentSidebar showPlayground={playground} />
        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopBar userName={student.name} email={student.email} studentGroup={student.studentGroup} />
          <main className="flex-1 bg-zinc-50">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  );
}
