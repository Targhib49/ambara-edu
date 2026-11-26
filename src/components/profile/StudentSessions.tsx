import { db } from "@/lib/db";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLanguage, getT } from "@/lib/i18n/server";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { nowMs } from "@/lib/sessions/format";
import { BookingPanel, type BookingSubject } from "@/components/sessions/BookingPanel";
import { sessionCredit } from "@/lib/billing/credit";
import { CalendarFeedCard } from "@/components/sessions/CalendarFeedCard";
import { ensureCalendarToken } from "@/lib/actions/booking";
import { formatSlotDay, formatSlotTime, generateSlots } from "@/lib/scheduling";
import { feedUrlFor } from "@/lib/sessions/feedUrl";

/**
 * A student's own sessions with booking, rescheduling and the calendar feed.
 * Rendered by the Sessions page (with its header) and by the Sessions tab of
 * the student's profile (actions only), so both stay one screen.
 */
export async function StudentSessions({ studentId, withHeader }: { studentId: string; withHeader: boolean }) {
  const t = await getT();
  const language = await getLanguage();

  const sessions = await db.session.findMany({
    where: { studentId: studentId },
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

  // The subjects this student can book, with any sessions already paid for.
  const [enrollments, credits] = await Promise.all([
    db.enrollment.findMany({ where: { studentId: studentId }, select: { course: { select: { id: true, title: true } } } }),
    sessionCredit(studentId),
  ]);
  const subjects: BookingSubject[] = enrollments.map((e) => ({
    value: e.course.id,
    label: e.course.title,
    credit: credits.find((c) => c.courseId === e.course.id)?.sessions ?? 0,
  }));

  const feedUrl = await feedUrlFor(await ensureCalendarToken());

  const now = nowMs();
  const upcomingCount = sessions.filter(
    (s) => s.startTime.getTime() >= now && (s.status === "CONFIRMED" || s.status === "PROPOSED")
  ).length;
  const needsResponse = sessions.filter(
    (s) => s.status === "RESCHEDULE_REQUESTED_BY_TUTOR" || s.status === "AWAITING_RESCHEDULE"
  ).length;

  const BOARD_OPENS_BEFORE_MS = 30 * 60_000;
  const rows = sessions.map((s) => ({
    boardOpen: s.startTime.getTime() - BOARD_OPENS_BEFORE_MS <= now,
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

  const actions = (
    <>
      {feedUrl && (
        <SlideOverButton label={t("sessions.calendarFeed")} title={t("sessions.calendarFeedTitle")} variant="secondary" icon="none">
          <CalendarFeedCard url={feedUrl} />
        </SlideOverButton>
      )}
      <SlideOverButton label={t("sessions.book")} title={t("sessions.book")} description={t("sessions.bookDescription")}>
        <BookingPanel slots={openSlots} subjects={subjects} />
      </SlideOverButton>
    </>
  );
  const meta = (
    <>
      {t("sessions.upcomingMeta", { n: upcomingCount })}
      {needsResponse > 0 && <span className="text-warning-ink"> · {t("sessions.needsResponse", { n: needsResponse })}</span>}
    </>
  );

  return (
    <div className="space-y-6">
      {withHeader ? (
        <PageHeader
          crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("sessions.title") }]}
          title={t("sessions.title")}
          meta={meta}
          actions={actions}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-subtle">{meta}</p>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
      )}
      <SessionsBoard role="student" sessions={rows} rescheduleSlots={openSlots} />
    </div>
  );
}
