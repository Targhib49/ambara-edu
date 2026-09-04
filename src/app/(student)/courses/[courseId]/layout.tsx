import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SidebarNav, type SidebarSection } from "@/components/ui/SidebarNav";
import { SidebarShell } from "@/components/ui/SidebarShell";
import { isEnabled } from "@/lib/flags";

export default async function StudentTrackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const student = await requireStudent();
  const courseV2 = await isEnabled("course_v2");

  const course = await db.course.findFirst({
    where: { id: courseId, enrollments: { some: { studentId: student.id } } },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              progress: { where: { studentId: student.id }, select: { completedAt: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const sections: SidebarSection[] = [
    { items: [{ href: `/courses/${course.id}`, label: "Overview" }] },
    ...course.chapters
      .filter((c) => c.lessons.length > 0)
      .map((c) => {
        const done = c.lessons.filter((l) => l.progress[0]?.completedAt != null).length;
        return {
          title: c.title,
          meta: courseV2 ? `${done}/${c.lessons.length}` : undefined,
          items: c.lessons.map((l) => ({
            href: `/courses/${course.id}/lessons/${l.id}`,
            label: l.title,
            done: courseV2 ? l.progress[0]?.completedAt != null : undefined,
          })),
        };
      }),
  ];

  return (
    <SidebarShell title={course.title} sidebar={<SidebarNav sections={sections} />}>
      {children}
    </SidebarShell>
  );
}
