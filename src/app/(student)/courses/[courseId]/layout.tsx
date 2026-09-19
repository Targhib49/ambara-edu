import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SidebarNav, type SidebarSection } from "@/components/ui/SidebarNav";
import { SidebarShell } from "@/components/ui/SidebarShell";
import { getT } from "@/lib/i18n/server";
import { isGradedStyle } from "@/lib/quiz/styles";

export default async function StudentTrackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const student = await requireStudent();
  const t = await getT();

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
          // The chapter's own quizzes — a chapter test or a guided project —
          // listed after its lessons, as on the course page. Quizzes inside a
          // lesson stay there, a click away, so the sidebar doesn't double up.
          quizzes: {
            where: { status: "PUBLISHED", lessonId: null },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              style: true,
              submissions: { where: { studentId: student.id }, select: { id: true } },
              practiceProgress: { where: { studentId: student.id }, select: { completedAt: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const sections: SidebarSection[] = [
    { items: [{ href: `/courses/${course.id}`, label: t("outline.overview") }] },
    ...course.chapters
      .filter((c) => c.lessons.length > 0 || c.quizzes.length > 0)
      .map((c) => {
        const items = [
          ...c.lessons.map((l) => ({
            href: `/courses/${course.id}/lessons/${l.id}`,
            label: l.title,
            done: l.progress[0]?.completedAt != null,
          })),
          ...c.quizzes.map((q) => ({
            href: `/quizzes/${q.id}`,
            label: q.title,
            badge: q.style === "PROJECT" ? t("outline.projectBadge") : t("quizList.chapterTest"),
            // Graded work is done once submitted (a project, once finished); practice once completed.
            done: isGradedStyle(q.style) ? q.submissions.length > 0 : q.practiceProgress[0]?.completedAt != null,
          })),
        ];
        return {
          title: c.title,
          meta: `${items.filter((i) => i.done).length}/${items.length}`,
          items,
        };
      }),
  ];

  return (
    <SidebarShell title={course.title} sidebar={<SidebarNav sections={sections} />}>
      {children}
    </SidebarShell>
  );
}
