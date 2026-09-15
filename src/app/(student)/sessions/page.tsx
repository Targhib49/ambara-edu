import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { nowMs } from "@/lib/sessions/format";
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
    tutorId: string;
  }[] = [];
  let feedUrl: string | null = null;
  // A tutor can ask for a new time whether or not self-booking is switched on,
  // so the student always gets slots to pick from when one is waiting on them.
  const awaitingNewTime = sessions.some((s) => s.status === "AWAITING_RESCHEDULE");
  if (schedulingV2 || awaitingNewTime) {
    const [windows, busy] = await Promise.all([
      db.availability.findMany({ where: { active: true } }),
      db.session.findMany({
        where: { // A session waiting for a new time no longer holds its old slot.
        status: { notIn: ["CANCELLED", "AWAITING_RESCHEDULE"] } },
        select: { tutorId: true, startTime: true, durationMinutes: true },
      }),
    ]);
    const now = new Date();
    openSlots = windows
      .flatMap((w) =>
        generateSlots([w], busy.filter((b) => b.tutorId === w.tutorId), now).map((slot) => ({
          ...slot,
          tutorId: w.tutorId,
        }))
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((slot) => ({
        availabilityId: slot.availabilityId,
        startIso: slot.start.toISOString(),
        durationMinutes: slot.durationMinutes,
        dayLabel: formatSlotDay(slot.start),
        timeLabel: formatSlotTime(slot.start),
        tutorId: slot.tutorId,
      }));
  }
  if (schedulingV2) feedUrl = await feedUrlFor(await ensureCalendarToken());

  const now = nowMs();
  const upcomingCount = sessions.filter(
    (s) => s.startTime.getTime() >= now && (s.status === "CONFIRMED" || s.status === "PROPOSED")
  ).length;
  const needsResponse = sessions.filter(
    (s) => s.status === "RESCHEDULE_REQUESTED_BY_TUTOR" || s.status === "AWAITING_RESCHEDULE"
  ).length;

  const rows = sessions.map((s) => ({
    id: s.id,
    tutorId: s.tutorId,
    tutorName: s.tutor.name,
    statusReason: s.statusReason,
    startTime: s.startTime.toISOString(),
    durationMinutes: s.durationMinutes,
    status: s.status,
    notes: s.notes,
    proposedAltTime: s.proposedAltTime?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "My sessions" }]}
        title="My sessions"
        meta={
          <>
            {upcomingCount} upcoming
            {needsResponse > 0 && <span className="text-amber-700"> · {needsResponse} needs your response</span>}
          </>
        }
        actions={
          schedulingV2 ? (
            <>
              {feedUrl && (
                <SlideOverButton
                  label="Calendar feed"
                  title="Add your sessions to a calendar"
                  variant="secondary"
                  icon="none"
                >
                  <CalendarFeedCard url={feedUrl} />
                </SlideOverButton>
              )}
              <SlideOverButton
                label="Book a session"
                title="Book a session"
                description="Open times over the next four weeks, in WIB. Booking confirms it straight away."
              >
                <BookingPanel slots={openSlots} />
              </SlideOverButton>
            </>
          ) : null
        }
      />

      <SessionsBoard role="student" sessions={rows} rescheduleSlots={openSlots} />
    </div>
  );
}
