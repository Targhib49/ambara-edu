import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLanguage, getT } from "@/lib/i18n/server";
import { courseOptions } from "@/lib/courses/options";
import { formatSessionShort, sessionStatusKey } from "@/lib/sessions/format";
import { toLocalParts } from "@/lib/scheduling";
import { weekdayKey } from "@/lib/sessions/format";
import { formatMinuteOfDay } from "@/lib/scheduling";
import { SubjectTagger, type TaggableSession } from "./SubjectTagger";

/**
 * Tagging past sessions with the subject they were for. Sessions booked
 * before subjects existed have none, and billing prices a session by its
 * subject — so this is the one-off catch-up, kept out of the way of the
 * normal sessions screen.
 */
export default async function SessionSubjectsPage() {
  const tutor = await requireTutor();
  const t = await getT();
  const language = await getLanguage();

  const [sessions, courses] = await Promise.all([
    db.session.findMany({
      where: { tutorId: tutor.id, status: { not: "CANCELLED" } },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        startTime: true,
        durationMinutes: true,
        status: true,
        studentId: true,
        student: { select: { name: true } },
        course: { select: { title: true } },
        series: { select: { weekday: true, startMinute: true } },
      },
    }),
    courseOptions(),
  ]);

  const rows: TaggableSession[] = sessions.map((s) => {
    const parts = toLocalParts(s.startTime);
    return {
      id: s.id,
      studentId: s.studentId,
      studentName: s.student.name,
      whenLabel: formatSessionShort(s.startTime, language),
      month: `${parts.year}-${String(parts.month + 1).padStart(2, "0")}`,
      durationMinutes: s.durationMinutes,
      statusLabel: t(sessionStatusKey(s.status)),
      subject: s.course?.title ?? null,
      seriesLabel: s.series
        ? `${t(weekdayKey(s.series.weekday))} ${formatMinuteOfDay(s.series.startMinute)}`
        : null,
    };
  });

  const students = [...new Map(rows.map((r) => [r.studentId, r.studentName])).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[
          { label: t("nav.home"), href: "/tutor" },
          { label: t("nav.sessions"), href: "/tutor/sessions" },
          { label: t("subjects.title") },
        ]}
        title={t("subjects.title")}
        meta={t("subjects.subtitle")}
      />
      <SubjectTagger sessions={rows} courses={courses.map((c) => ({ value: c.value, label: c.label }))} students={students} />
    </div>
  );
}
