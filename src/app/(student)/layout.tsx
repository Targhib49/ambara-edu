import { requireStudent } from "@/lib/auth";
import { StudentTopNav } from "@/components/ui/StudentTopNav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent();
  return (
    <>
      <StudentTopNav
        userName={student.name}
        links={[
          { href: "/tracks", label: "My tracks" },
          { href: "/sessions", label: "My sessions" },
        ]}
      />
      <main className="flex w-full flex-1 bg-zinc-100">{children}</main>
    </>
  );
}
