import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function StudentSessionsPage() {
  const student = await requireStudent();

  const sessions = await db.session.findMany({
    where: { studentId: student.id },
    include: { tutor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  const rows = sessions.map((s) => ({
    id: s.id,
    tutorName: s.tutor.name,
    startTime: s.startTime.toISOString(),
    durationMinutes: s.durationMinutes,
    status: s.status,
    notes: s.notes,
    proposedAltTime: s.proposedAltTime?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tracks" }, { label: "My sessions" }]} />
        <h1 className="text-2xl font-semibold">My sessions</h1>
      </div>

      <SessionsBoard role="student" sessions={rows} />
    </div>
  );
}
