import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { StudentSessionRow } from "@/components/sessions/StudentSessionRow";
import { nowMs } from "@/lib/sessions/format";

export default async function StudentSessionsPage() {
  const student = await requireStudent();

  const sessions = await db.session.findMany({
    where: { studentId: student.id },
    include: { tutor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  const now = nowMs();
  const rows = sessions.map((s) => ({
    id: s.id,
    tutorName: s.tutor.name,
    startTime: s.startTime.toISOString(),
    durationMinutes: s.durationMinutes,
    status: s.status,
    notes: s.notes,
    proposedAltTime: s.proposedAltTime?.toISOString() ?? null,
  }));

  const upcoming = rows
    .filter((s) => s.status !== "CANCELLED" && new Date(s.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const past = rows
    .filter((s) => s.status === "CANCELLED" || new Date(s.startTime).getTime() < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">My sessions</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 && <p className="text-sm text-zinc-500">No upcoming sessions.</p>}
        {upcoming.map((s) => (
          <StudentSessionRow key={s.id} session={s} isPast={false} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Past</h2>
        {past.length === 0 && <p className="text-sm text-zinc-500">No past sessions yet.</p>}
        {past.map((s) => (
          <StudentSessionRow key={s.id} session={s} isPast={true} />
        ))}
      </section>
    </div>
  );
}
