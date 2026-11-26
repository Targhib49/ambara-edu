import Link from "next/link";
import { GRADED_STYLES } from "@/lib/quiz/styles";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { StudentSessionRow } from "@/components/sessions/StudentSessionRow";
import { loadBilling } from "@/components/profile/BillingOverview";
import { Card } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { badgeColorForKey } from "@/lib/ui/palette";
import { summarizeCourseProgress } from "@/lib/progress";
import { formatIDR } from "@/lib/billing/money";
import { appClock, nowMs } from "@/lib/sessions/format";
import { getLanguage, getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";

const GREETINGS: [number, MessageKey][] = [
  [11, "dash.greeting.morning"],
  [15, "dash.greeting.midday"],
  [19, "dash.greeting.afternoon"],
  [24, "dash.greeting.evening"],
];

const BOARD_OPENS_BEFORE_MS = 30 * 60_000;
const QUIZZES_SHOWN = 3;

/**
 * The student's home, kept to three questions: when is my next lesson, what
 * should I study, and do I owe anything. Scores and stats live on the
 * profile's Progress tab, one link away, rather than competing for attention.
 */
export default async function StudentDashboardPage() {
  const student = await requireStudent();
  const t = await getT();
  const language = await getLanguage();
  const now = nowMs();
  const clock = appClock(new Date(now), language);

  const [enrollments, submittedQuizIds, sessions, chapterTests, billing] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: student.id, course: { status: "PUBLISHED" } },
      orderBy: { createdAt: "asc" },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            chapters: {
              orderBy: { order: "asc" },
              select: {
                lessons: {
                  where: { status: "PUBLISHED" },
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    title: true,
                    // Graded quizzes only: practice is never "due".
                    quizzes: { where: { status: "PUBLISHED", style: { in: GRADED_STYLES } }, select: { id: true, title: true } },
                    progress: { where: { studentId: student.id }, select: { completedAt: true, lastViewedAt: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.submission
      .findMany({ where: { studentId: student.id }, select: { quizId: true } })
      .then((rows) => new Set(rows.map((r) => r.quizId))),
    db.session.findMany({
      // Coming up, plus anything waiting on the student's reply whatever its date.
      where: {
        studentId: student.id,
        OR: [
          { startTime: { gte: new Date(now - BOARD_OPENS_BEFORE_MS) }, status: { in: ["CONFIRMED", "PROPOSED"] } },
          { status: { in: ["RESCHEDULE_REQUESTED_BY_TUTOR", "AWAITING_RESCHEDULE"] } },
        ],
      },
      include: { tutor: { select: { name: true } } },
      orderBy: { startTime: "asc" },
      take: 3,
    }),
    // Chapter tests in the student's courses; lesson quizzes come with the enrollments.
    db.quiz.findMany({
      where: {
        lessonId: null,
        status: "PUBLISHED",
        style: { in: GRADED_STYLES },
        chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } } },
      },
      select: { id: true, title: true, chapter: { select: { title: true, course: { select: { title: true } } } } },
    }),
    loadBilling(student.id, "student"),
  ]);

  const courses = enrollments.map(({ course }) => {
    const lessons = course.chapters.flatMap((c) => c.lessons);
    const summary = summarizeCourseProgress(lessons);
    const resume = summary.resumeLessonId ? lessons.find((l) => l.id === summary.resumeLessonId) : undefined;
    return { id: course.id, title: course.title, pct: summary.pct, done: summary.completed, total: summary.total, resume };
  });

  const due = [
    ...chapterTests
      .filter((q) => !submittedQuizIds.has(q.id))
      .map((q) => ({
        id: q.id,
        title: q.title,
        context: q.chapter ? `${q.chapter.course.title} · ${q.chapter.title}` : t("courseEditor.chapterTest"),
      })),
    ...enrollments.flatMap(({ course }) =>
      course.chapters.flatMap((c) =>
        c.lessons.flatMap((l) =>
          l.quizzes
            .filter((q) => !submittedQuizIds.has(q.id))
            .map((q) => ({ id: q.id, title: q.title, context: `${course.title} · ${l.title}` }))
        )
      )
    ),
  ];

  const waitingOnMe = sessions.filter((s) => s.status === "RESCHEDULE_REQUESTED_BY_TUTOR" || s.status === "AWAITING_RESCHEDULE");
  const greeting = t(GREETINGS.find(([until]) => clock.hour < until)?.[1] ?? "dash.greeting.evening");
  const summary = [
    waitingOnMe.length > 0 ? t("dash.summary.reply", { n: waitingOnMe.length }) : null,
    due.length > 0 ? t("dash.summary.quizzes", { n: due.length }) : null,
    billing.owed > 0 ? t("dash.summary.owed", { amount: formatIDR(billing.owed, language) }) : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <header>
        <p className="text-sm text-ink-subtle">{clock.longDate()}</p>
        <h1 className="text-2xl font-semibold text-ink">
          {greeting}, {student.name.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-sm text-ink-muted">{summary.length > 0 ? summary.join(" · ") : t("dash.summary.clear")}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* On a phone the next lesson comes first; on a wide screen it sits on the right. */}
        <div className="space-y-6 lg:order-last">
          <section className="space-y-2" aria-labelledby="next-heading">
            <div className="flex items-baseline justify-between">
              <h2 id="next-heading" className="font-medium text-ink">
                {t("profile.nextSession")}
              </h2>
              <Link href="/sessions" className="text-xs font-medium text-brand-ink hover:underline">
                {t("action.viewAll")} →
              </Link>
            </div>
            {sessions.length === 0 ? (
              <Card className="text-sm text-ink-subtle">
                {t("dash.noSessionsScheduled")}{" "}
                <Link href="/sessions" className="font-medium text-brand-ink hover:underline">
                  {t("sessions.book")}
                </Link>
              </Card>
            ) : (
              sessions.map((s) => (
                <StudentSessionRow
                  key={s.id}
                  isPast={false}
                  session={{
                    id: s.id,
                    tutorId: s.tutorId,
                    tutorName: s.tutor.name,
                    startTime: s.startTime.toISOString(),
                    durationMinutes: s.durationMinutes,
                    status: s.status,
                    notes: s.notes,
                    statusReason: s.statusReason,
                    proposedAltTime: s.proposedAltTime?.toISOString() ?? null,
                    boardOpen: s.startTime.getTime() - BOARD_OPENS_BEFORE_MS <= now,
                  }}
                />
              ))
            )}
          </section>

          {/* Only when there's something to pay: a settled account isn't news. */}
          {billing.owed > 0 && (
            <Card className="border-warning-line bg-warning-wash">
              <p className="text-xs font-medium uppercase tracking-wide text-warning-ink">{t("studentBilling.owed")}</p>
              <p className="mt-1 text-2xl font-semibold text-warning-ink">{formatIDR(billing.owed, language)}</p>
              <Link href="/billing" className="mt-2 inline-block text-sm font-medium text-warning-ink underline">
                {t("profile.seeBilling")}
              </Link>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <section className="space-y-2" aria-labelledby="study-heading">
            <h2 id="study-heading" className="font-medium text-ink">
              {t("dash.study")}
            </h2>
            {courses.length === 0 ? (
              <Card className="text-sm text-ink-subtle">{t("dash.noCourses")}</Card>
            ) : (
              <Card padding="none" as="div">
                <ul className="divide-y divide-line-soft">
                  {courses.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                      <div className="min-w-0 flex-1 basis-56">
                        <Link href={`/courses/${c.id}`} className="flex min-w-0 items-center gap-2 font-medium text-ink hover:underline">
                          <span className={`h-3 w-3 shrink-0 rounded-sm ${badgeColorForKey(c.title).split(" ")[0]}`} />
                          <span className="line-clamp-2">{c.title}</span>
                        </Link>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                            <div className="h-full rounded-full bg-brand" style={{ width: `${c.pct}%` }} />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-ink-subtle">{c.pct}%</span>
                        </div>
                        {c.resume && <p className="mt-1.5 truncate text-xs text-ink-subtle">{t("dash.upNext", { title: c.resume.title })}</p>}
                      </div>
                      {c.resume ? (
                        <Link href={`/courses/${c.id}/lessons/${c.resume.id}`} className={buttonClass("secondary", "shrink-0")}>
                          {c.done > 0 ? t("dash.continue") : t("dash.start")}
                        </Link>
                      ) : (
                        c.total > 0 && <span className="shrink-0 text-xs font-medium text-success-ink">{t("dash.courseDone")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          {due.length > 0 && (
            <section className="space-y-2" aria-labelledby="quizzes-heading">
              <div className="flex items-baseline justify-between">
                <h2 id="quizzes-heading" className="font-medium text-ink">
                  {t("dash.quizzesWaiting", { n: due.length })}
                </h2>
                {due.length > QUIZZES_SHOWN && (
                  <Link href="/quizzes" className="text-xs font-medium text-brand-ink hover:underline">
                    {t("dash.moreQuizzes", { n: due.length - QUIZZES_SHOWN })}
                  </Link>
                )}
              </div>
              <Card padding="none" as="div">
                <ul className="divide-y divide-line-soft">
                  {due.slice(0, QUIZZES_SHOWN).map((q) => (
                    <li key={q.id}>
                      <Link href={`/quizzes/${q.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{q.title}</span>
                          <span className="block truncate text-xs text-ink-subtle">{q.context}</span>
                        </span>
                        <span aria-hidden className="shrink-0 text-ink-faint">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          <Link href="/profile?tab=progress" className="inline-block text-sm font-medium text-brand-ink hover:underline">
            {t("dash.seeProgress")}
          </Link>
        </div>
      </div>
    </div>
  );
}
