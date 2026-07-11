import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SidebarNav, type SidebarSection } from "@/components/ui/SidebarNav";
import { SidebarShell } from "@/components/ui/SidebarShell";

export default async function StudentTrackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const student = await requireStudent();

  const track = await db.track.findFirst({
    where: { id: trackId, enrollments: { some: { studentId: student.id } } },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: { id: true, title: true },
          },
        },
      },
    },
  });
  if (!track) notFound();

  const sections: SidebarSection[] = [
    { items: [{ href: `/tracks/${track.id}`, label: "Overview" }] },
    ...track.modules
      .filter((m) => m.lessons.length > 0)
      .map((m) => ({
        title: m.title,
        items: m.lessons.map((l) => ({
          href: `/tracks/${track.id}/lessons/${l.id}`,
          label: l.title,
        })),
      })),
  ];

  return (
    <SidebarShell title={track.title} sidebar={<SidebarNav sections={sections} />}>
      {children}
    </SidebarShell>
  );
}
