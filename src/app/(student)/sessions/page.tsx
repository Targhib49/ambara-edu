import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLanguage, getT } from "@/lib/i18n/server";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { nowMs } from "@/lib/sessions/format";
import { BookingPanel } from "@/components/sessions/BookingPanel";
import { CalendarFeedCard } from "@/components/sessions/CalendarFeedCard";
import { ensureCalendarToken } from "@/lib/actions/booking";
import { formatSlotDay, formatSlotTime, generateSlots } from "@/lib/scheduling";
import { feedUrlFor } from "@/lib/sessions/feedUrl";

export default async function StudentSessionsPage() {
  const student = await requireStudent();
  const t = await getT();
  const language = await getLanguage();

  const sessions = await db.session.findMany({
    where: { studentId: student.id },
    include: { tutor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  // Open slots across every tutor who has published availability. Booked time
  // is excluded per tutor, so one tutor's bookings never hide another's slots.
  const [windows, busy] = await Promise.all([
    db.availability.findMany({ where: { active: true } }),
    db.session.findMany({
      where: { // A session waiting for a new time no longer holds its old slot.
      status: { notIn: ["CANCELLED", "AWAITING_RESCHEDULE"] } },
      select: { tutorId: true, startTime: true, durationMinutes: true },
    }),
  ]);
  const openSlots = windows
    .flatMap((w) =>
      generateSlots([w], busy.filter((b) => b.tutorId === w.tutorId), new Date()).map((slot) => ({
        ...slot,
        tutorId: w.tutorId,
      }))
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((slot) => ({
      availabilityId: slot.availabilityId,
      startIso: slot.start.toISOString(),
      durationMinutes: slot.durationMinutes,
      dayLabel: formatSlotDay(slot.start, language),
      timeLabel: formatSlotTime(slot.start),
      tutorId: slot.tutorId,
    }));

  const feedUrl = await feedUrlFor(await ensureCalendarToken());

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
        crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("sessions.title") }]}
        title={t("sessions.title")}
        meta={
          <>
            {t("sessions.upcomingMeta", { n: upcomingCount })}
            {needsResponse > 0 && (
              <span className="text-amber-700"> · {t("sessions.needsResponse", { n: needsResponse })}</span>
            )}
          </>
        }
        actions={
          <>
              {feedUrl && (
                <SlideOverButton
                  label={t("sessions.calendarFeed")}
                  title={t("sessions.calendarFeedTitle")}
                  variant="secondary"
                  icon="none"
                >
                  <CalendarFeedCard url={feedUrl} />
                </SlideOverButton>
              )}
              <SlideOverButton
                label={t("sessions.book")}
                title={t("sessions.book")}
                description={t("sessions.bookDescription")}
              >
            <BookingPanel slots={openSlots} />
          </SlideOverButton>
          </>
        }
      />

      <SessionsBoard role="student" sessions={rows} rescheduleSlots={openSlots} />
    </div>
  );
}
