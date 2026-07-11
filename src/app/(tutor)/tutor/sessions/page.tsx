import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { createSession } from "@/lib/actions/sessions";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const inputCls =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

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

      <form
        action={createSession}
        className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5"
      >
        <h2 className="font-medium">Schedule a session</h2>
        {students.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No students yet — add one on the Students page first.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Student</label>
              <select name="studentId" required className={inputCls}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Start time</label>
              <input type="datetime-local" name="startTime" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Duration (min)</label>
              <input
                type="number"
                name="durationMinutes"
                defaultValue={60}
                min={15}
                step={15}
                required
                className={`${inputCls} w-24`}
              />
            </div>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Schedule
            </button>
          </div>
        )}
      </form>

      <SessionsBoard sessions={rows} />
    </div>
  );
}
