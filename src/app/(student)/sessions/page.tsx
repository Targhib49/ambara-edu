import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BookingPanel } from "@/components/sessions/BookingPanel";
import { CalendarFeedCard } from "@/components/sessions/CalendarFeedCard";
import { ensureCalendarToken } from "@/lib/actions/booking";
import { isEnabled } from "@/lib/flags";
import { formatSlotDay, formatSlotTime, generateSlots } from "@/lib/scheduling";
import { feedUrlFor } from "@/lib/sessions/feedUrl";

export default async function StudentSessionsPage() {
  const student = await requireStudent();
  const schedulingV2 = await isEnabled("scheduling_v2");

  const sessions = await db.session.findMany({
    where: { studentId: student.id },
    include: { tutor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  // Open slots across every tutor who has published availability. Booked time
  // is excluded per tutor, so one tutor's bookings never hide another's slots.
  let openSlots: {
    availabilityId: string;
    startIso: string;
    durationMinutes: number;
    dayLabel: string;
    timeLabel: string;
  }[] = [];
  let feedUrl: string | null = null;
  if (schedulingV2) {
    const [windows, busy] = await Promise.all([
      db.availability.findMany({ where: { active: true } }),
      db.session.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { tutorId: true, startTime: true, durationMinutes: true },
      }),
    ]);
    const now = new Date();
    openSlots = windows
      .flatMap((w) =>
        generateSlots([w], busy.filter((b) => b.tutorId === w.tutorId), now)
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((slot) => ({
        availabilityId: slot.availabilityId,
        startIso: slot.start.toISOString(),
        durationMinutes: slot.durationMinutes,
        dayLabel: formatSlotDay(slot.start),
        timeLabel: formatSlotTime(slot.start),
      }));
    feedUrl = await feedUrlFor(await ensureCalendarToken());
  }

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
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "My sessions" }]} />
        <h1 className="text-2xl font-semibold">My sessions</h1>
      </div>

      {schedulingV2 && <BookingPanel slots={openSlots} />}

      <SessionsBoard role="student" sessions={rows} />

      {schedulingV2 && feedUrl && <CalendarFeedCard url={feedUrl} />}
    </div>
  );
}
