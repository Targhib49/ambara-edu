import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SidebarNav, type SidebarSection } from "@/components/ui/SidebarNav";
import { SidebarShell } from "@/components/ui/SidebarShell";

export default async function TutorTrackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, status: true } },
        },
      },
    },
  });
  if (!course) notFound();

  const sections: SidebarSection[] = [
    { items: [{ href: `/tutor/courses/${course.id}`, label: "Overview & settings" }] },
    ...course.chapters.map((m) => ({
      title: m.title,
      items: m.lessons.map((l) => ({
        href: `/tutor/courses/${course.id}/lessons/${l.id}`,
        label: l.title,
        badge: l.status === "DRAFT" ? "Draft" : undefined,
      })),
    })),
  ];

  return (
    <SidebarShell title={course.title} sidebar={<SidebarNav sections={sections} />}>
      {children}
    </SidebarShell>
  );
}
