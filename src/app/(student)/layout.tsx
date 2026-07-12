import { requireStudent } from "@/lib/auth";
import { StudentSidebar } from "@/components/ui/StudentSidebar";
import { StudentTopBar } from "@/components/ui/StudentTopBar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent();
  return (
    <div className="flex min-h-screen w-full flex-1">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudentTopBar userName={student.name} />
        <main className="flex-1 bg-zinc-50">{children}</main>
      </div>
    </div>
  );
}
