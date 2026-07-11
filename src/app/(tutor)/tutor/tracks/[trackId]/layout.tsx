import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SidebarNav, type SidebarSection } from "@/components/ui/SidebarNav";
import { SidebarShell } from "@/components/ui/SidebarShell";

export default async function TutorTrackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const track = await db.track.findUnique({
    where: { id: trackId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, status: true } },
        },
      },
    },
  });
  if (!track) notFound();

  const sections: SidebarSection[] = [
    { items: [{ href: `/tutor/tracks/${track.id}`, label: "Overview & settings" }] },
    ...track.modules.map((m) => ({
      title: m.title,
      items: m.lessons.map((l) => ({
        href: `/tutor/tracks/${track.id}/lessons/${l.id}`,
        label: l.title,
        badge: l.status === "DRAFT" ? "Draft" : undefined,
      })),
    })),
  ];

  return (
    <SidebarShell title={track.title} sidebar={<SidebarNav sections={sections} />}>
      {children}
    </SidebarShell>
  );
}
