import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SidebarNav, type SidebarSection } from "@/components/ui/SidebarNav";
import { SidebarShell } from "@/components/ui/SidebarShell";
import { getT } from "@/lib/i18n/server";

// The course outline beside the lesson editor, for hopping between lessons.
// Only lessons get it: the course page's Syllabus tab already is the outline,
// and a second sidebar there left the editor too narrow to read.
export default async function TutorLessonsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const t = await getT();
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
    { items: [{ href: `/tutor/courses/${course.id}`, label: t("lessonSidebar.backToSyllabus") }] },
    ...course.chapters.map((m) => ({
      title: m.title,
      items: m.lessons.map((l) => ({
        href: `/tutor/courses/${course.id}/lessons/${l.id}`,
        label: l.title,
        badge: l.status === "DRAFT" ? t("status.draft") : undefined,
      })),
    })),
  ];

  return (
    <SidebarShell title={course.title} sidebar={<SidebarNav sections={sections} />}>
      {children}
    </SidebarShell>
  );
}
