import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { ScheduleSessionForm } from "@/components/sessions/ScheduleSessionForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AvailabilityEditor } from "@/components/sessions/AvailabilityEditor";
import { RecurringSessionForm } from "@/components/sessions/RecurringSessionForm";
import { CalendarFeedCard } from "@/components/sessions/CalendarFeedCard";
import { ensureCalendarToken } from "@/lib/actions/booking";
import { isEnabled } from "@/lib/flags";
import { toLocalParts } from "@/lib/scheduling";
import { feedUrlFor } from "@/lib/sessions/feedUrl";

export default async function TutorSessionsPage() {
  const tutor = await requireTutor();
  const schedulingV2 = await isEnabled("scheduling_v2");

  const [sessions, students] = await Promise.all([
    db.session.findMany({
      where: { tutorId: tutor.id },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { startTime: "asc" },
    }),
    db.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }),
  ]);

  const windows = schedulingV2
    ? await db.availability.findMany({
        where: { tutorId: tutor.id },
        orderBy: [{ weekday: "asc" }, { startMinute: "asc" }],
      })
    : [];
  const feedUrl = schedulingV2 ? await feedUrlFor(await ensureCalendarToken()) : null;
  // Default for the series start-date input, in the app's timezone rather than
  // the server's.
  const local = toLocalParts(new Date());
  const todayValue = `${local.year}-${String(local.month + 1).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;

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

      {schedulingV2 && (
        <>
          <AvailabilityEditor
            windows={windows.map((w) => ({
              id: w.id,
              weekday: w.weekday,
              startMinute: w.startMinute,
              durationMinutes: w.durationMinutes,
              active: w.active,
            }))}
          />
          {students.length > 0 && (
            <RecurringSessionForm
              students={students.map((s) => ({ id: s.id, name: s.name }))}
              today={todayValue}
            />
          )}
          {feedUrl && <CalendarFeedCard url={feedUrl} />}
        </>
      )}

      <SessionsBoard role="tutor" sessions={rows} />
    </div>
  );
}
