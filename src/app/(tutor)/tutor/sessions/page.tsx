import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { ScheduleSessionForm } from "@/components/sessions/ScheduleSessionForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function TutorSessionsPage() {
  const tutor = await requireTutor();

  const [sessions, students] = await Promise.all([
    db.session.findMany({
      where: { tutorId: tutor.id },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { startTime: "asc" },
    }),
    db.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }),
  ]);

  const rows = sessions.map((s) => ({
    id: s.id,
    studentName: s.student.name,
    startTime: s.startTime.toISOString(),
    durationMinutes: s.durationMinutes,
    status: s.status,
    notes: s.notes,
    proposedAltTime: s.proposedAltTime?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Sessions" }]} />
        <h1 className="text-2xl font-semibold">Sessions</h1>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-medium">Schedule a session</h2>
          <p className="mt-2 text-sm text-zinc-500">
            No students yet — add one on the Students page first.
          </p>
        </div>
      ) : (
        <ScheduleSessionForm students={students.map((s) => ({ id: s.id, name: s.name }))} />
      )}

      <SessionsBoard sessions={rows} />
    </div>
  );
}
