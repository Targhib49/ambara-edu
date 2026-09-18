import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { SessionsBoard } from "@/components/sessions/SessionsBoard";
import type { TutorSessionTableRow } from "@/components/sessions/TutorSessionsTable";
import { formatSessionShort, nowMs } from "@/lib/sessions/format";
import { ScheduleSessionForm } from "@/components/sessions/ScheduleSessionForm";
import { AvailabilityEditor } from "@/components/sessions/AvailabilityEditor";
import { CalendarFeedCard } from "@/components/sessions/CalendarFeedCard";
import { ensureCalendarToken } from "@/lib/actions/booking";
import { toLocalParts } from "@/lib/scheduling";
import { feedUrlFor } from "@/lib/sessions/feedUrl";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { cardCls } from "@/components/ui/styles";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { studentOptions } from "@/lib/students/options";
import { getLanguage, getT } from "@/lib/i18n/server";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function localDate(instant: Date) {
  const p = toLocalParts(instant);
  return `${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export default async function TutorSessionsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tutor = await requireTutor();
  const { tab: requestedTab } = await searchParams;
  const tab = requestedTab === "availability" ? "availability" : "schedule";
  const t = await getT();
  const language = await getLanguage();

  const [sessions, students, activeWindows] = await Promise.all([
    db.session.findMany({
      where: { tutorId: tutor.id },
      include: { student: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    studentOptions(),
    db.availability.count({ where: { tutorId: tutor.id, active: true } }),
  ]);

  const now = nowMs();
  const rows: TutorSessionTableRow[] = sessions.map((s) => ({
    id: s.id,
    studentName: s.student.name,
    startTime: s.startTime.toISOString(),
    whenLabel: formatSessionShort(s.startTime, language),
    localDate: localDate(s.startTime),
    durationMinutes: s.durationMinutes,
    status: s.status,
    notes: s.notes,
    statusReason: s.statusReason,
    attendance: s.attendance,
    proposedAltLabel: s.proposedAltTime ? formatSessionShort(s.proposedAltTime, language) : null,
    hasStarted: s.startTime.getTime() <= now,
  }));

  const needsAction = rows.filter(
    (r) => r.status === "RESCHEDULE_REQUESTED_BY_STUDENT" || (r.status === "CONFIRMED" && r.hasStarted)
  ).length;
  const thisWeek = sessions.filter(
    (s) =>
      (s.status === "CONFIRMED" || s.status === "PROPOSED") &&
      s.startTime.getTime() >= now &&
      s.startTime.getTime() < now + WEEK_MS
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("tutorSessions.title") }]}
        title={t("tutorSessions.title")}
        meta={
          <>
            {t("tutorSessions.meta", { n: thisWeek })}
            {needsAction > 0 && <span className="text-amber-700"> · {t("tutorSessions.needAction", { n: needsAction })}</span>}
          </>
        }
        actions={
          students.length > 0 ? (
            <SlideOverButton
              label={t("tutorSessions.schedule")}
              title={t("tutorSessions.scheduleTitle")}
              description={t("tutorSessions.allTimesWib")}
            >
              <ScheduleSessionForm students={students} today={localDate(new Date(now))} />
            </SlideOverButton>
          ) : null
        }
      />

      {(
        <PageTabs
          active={tab}
          tabs={[
            { key: "schedule", label: t("tutorSessions.tab.schedule"), href: "/tutor/sessions" },
            {
              key: "availability",
              label: t("tutorSessions.tab.availability"),
              href: "/tutor/sessions?tab=availability",
              count: activeWindows,
            },
          ]}
        />
      )}

      {tab === "schedule" ? (
        <SessionsBoard role="tutor" sessions={rows} />
      ) : (
        <AvailabilityTab tutorId={tutor.id} />
      )}
    </div>
  );
}

async function AvailabilityTab({ tutorId }: { tutorId: string }) {
  const [windows, token] = await Promise.all([
    db.availability.findMany({ where: { tutorId }, orderBy: [{ weekday: "asc" }, { startMinute: "asc" }] }),
    ensureCalendarToken(),
  ]);
  const feedUrl = await feedUrlFor(token);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <AvailabilityEditor
        windows={windows.map((w) => ({
          id: w.id,
          weekday: w.weekday,
          startMinute: w.startMinute,
          durationMinutes: w.durationMinutes,
          active: w.active,
        }))}
      />
      <section className={`${cardCls} p-5`}>
        <h2 className="text-sm font-semibold text-zinc-900">Calendar subscription</h2>
        <div className="mt-2">
          <CalendarFeedCard url={feedUrl} />
        </div>
      </section>
    </div>
  );
}
