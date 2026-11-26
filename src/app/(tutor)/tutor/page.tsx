import Link from "next/link";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { appClock, nowMs, formatSessionTime } from "@/lib/sessions/format";
import { formatSlotTime } from "@/lib/scheduling";
import { StatusBadge } from "@/components/sessions/StatusBadge";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { badgeColorFor, badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { GRADED_STYLES } from "@/lib/quiz/styles";
import { outstanding } from "@/lib/billing/invoice";
import { formatIDR } from "@/lib/billing/money";
import { dateLabel, todayDate } from "@/lib/billing/period";
import { PLACEHOLDER_EMAIL_DOMAIN, isPlaceholderEmail } from "@/lib/students/placeholder";
import { getLanguage, getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";

function greetingKey(hour: number): MessageKey {
  if (hour < 12) return "tutor.greeting.morning";
  if (hour < 18) return "tutor.greeting.afternoon";
  return "tutor.greeting.evening";
}

/** Each to-do shows its first few items by name; the rest are behind "view all". */
const SHOWN_PER_TODO = 3;

type TodoItem = { key: string; href: string; title: string; detail: string };
type Todo = { key: string; title: string; tone: Tone; items: TodoItem[]; allHref: string };

/**
 * The tutor's home: what needs doing, then today's lessons. Every to-do is
 * something only the tutor can move forward, listed by name so it can be
 * acted on from here; a group with nothing in it doesn't show at all.
 */
export default async function TutorDashboardPage() {
  const tutor = await requireTutor();
  const now = new Date(nowMs());
  const t = await getT();
  const language = await getLanguage();
  const clock = appClock(now, language);
  const today = todayDate();

  const [courses, sessions, toReview, overdue, requests, pendingStudents] = await Promise.all([
    db.course.findMany({
      where: { ownerId: tutor.id },
      orderBy: { createdAt: "asc" },
      include: {
        chapters: { include: { lessons: { select: { status: true } } } },
        _count: { select: { enrollments: true } },
      },
    }),
    db.session.findMany({
      // Upcoming, plus anything still open in the past (waiting on an outcome or a reply).
      where: {
        tutorId: tutor.id,
        OR: [
          { startTime: { gte: new Date(clock.dayStart(0)) }, status: { notIn: ["CANCELLED", "AWAITING_RESCHEDULE"] } },
          { status: { in: ["CONFIRMED", "RESCHEDULE_REQUESTED_BY_STUDENT"] } },
        ],
      },
      include: { student: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    db.submission.findMany({
      where: { status: "PENDING_REVIEW", quiz: { style: { in: GRADED_STYLES } } },
      orderBy: { updatedAt: "asc" },
      select: { id: true, quizId: true, updatedAt: true, student: { select: { name: true } }, quiz: { select: { title: true } } },
    }),
    db.invoice.findMany({
      where: { status: "SENT", dueOn: { lt: today } },
      orderBy: { dueOn: "asc" },
      select: {
        id: true,
        number: true,
        dueOn: true,
        student: { select: { name: true } },
        items: { select: { quantity: true, unitAmount: true } },
        payments: { select: { amount: true } },
      },
    }),
    db.syllabusRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, syllabusId: true, createdAt: true, student: { select: { name: true } }, syllabus: { select: { title: true } } },
    }),
    db.user.findMany({
      where: { role: "STUDENT", email: { endsWith: `@${PLACEHOLDER_EMAIL_DOMAIN}` } },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, invite: { select: { kind: true, expiresAt: true } } },
    }),
  ]);

  const nowTime = now.getTime();
  const todayStart = clock.dayStart(0);
  const tomorrowStart = clock.dayStart(1);
  const weekEnd = clock.dayStart(7);
  const endOf = (s: { startTime: Date; durationMinutes: number }) => s.startTime.getTime() + s.durationMinutes * 60_000;

  const rescheduleRequests = sessions.filter((s) => s.status === "RESCHEDULE_REQUESTED_BY_STUDENT");
  // Over but never closed out: these can't be billed until they're marked done.
  const toCloseOut = sessions.filter((s) => s.status === "CONFIRMED" && endOf(s) <= nowTime);
  const live = (s: (typeof sessions)[number]) => s.status !== "COMPLETED" && s.status !== "RESCHEDULE_REQUESTED_BY_STUDENT";
  const todaySessions = sessions.filter(
    (s) => s.startTime.getTime() >= todayStart && s.startTime.getTime() < tomorrowStart && s.status !== "CANCELLED"
  );
  const laterThisWeek = sessions.filter(
    (s) => s.startTime.getTime() >= tomorrowStart && s.startTime.getTime() < weekEnd && live(s)
  );
  const invites = pendingStudents.filter((s) => isPlaceholderEmail(s.email));

  const day = (d: Date) => dateLabel(d, language);
  const todos = (
    [
      {
        key: "reschedule",
        title: t("home.todo.reschedule"),
        tone: "warning",
        allHref: "/tutor/sessions",
        items: rescheduleRequests.map((s) => ({
          key: s.id,
          href: "/tutor/sessions",
          title: s.student.name,
          detail: formatSessionTime(s.startTime, language),
        })),
      },
      {
        key: "closeOut",
        title: t("home.todo.closeOut"),
        tone: "warning",
        allHref: "/tutor/sessions",
        items: toCloseOut.map((s) => ({
          key: s.id,
          href: "/tutor/sessions",
          title: s.student.name,
          detail: formatSessionTime(s.startTime, language),
        })),
      },
      {
        key: "review",
        title: t("home.todo.review"),
        tone: "brand",
        allHref: "/tutor/quizzes",
        items: toReview.map((s) => ({
          key: s.id,
          href: `/tutor/quizzes/${s.quizId}/submissions/${s.id}`,
          title: s.student.name,
          detail: `${s.quiz.title} · ${t("home.submitted", { date: day(s.updatedAt) })}`,
        })),
      },
      {
        key: "overdue",
        title: t("home.todo.overdue"),
        tone: "danger",
        allHref: "/tutor/billing",
        items: overdue
          .map((i) => ({ ...i, owed: outstanding(i.items, i.payments) }))
          .filter((i) => i.owed > 0)
          .map((i) => ({
            key: i.id,
            href: `/tutor/billing/${i.id}`,
            title: i.student.name,
            detail: `${formatIDR(i.owed, language)} · ${t("home.dueOn", { date: i.dueOn ? day(i.dueOn) : "—" })}`,
          })),
      },
      {
        key: "requests",
        title: t("home.todo.requests"),
        tone: "brand",
        allHref: "/tutor/syllabi",
        items: requests.map((r) => ({
          key: r.id,
          href: `/tutor/syllabi/${r.syllabusId}`,
          title: r.student.name,
          detail: r.syllabus.title,
        })),
      },
      {
        key: "invites",
        title: t("home.todo.invites"),
        tone: "neutral",
        allHref: "/tutor/students",
        items: invites.map((s) => {
          const expired = !s.invite || s.invite.kind !== "JOIN" || s.invite.expiresAt.getTime() <= nowTime;
          return {
            key: s.id,
            href: `/tutor/students/${s.id}?tab=account`,
            title: s.name,
            detail: expired ? t("home.inviteExpired") : t("home.inviteUntil", { date: day(s.invite!.expiresAt) }),
          };
        }),
      },
    ] satisfies Todo[]
  ).filter((todo) => todo.items.length > 0);

  let draftLessons = 0;
  for (const course of courses) {
    for (const chapter of course.chapters) draftLessons += chapter.lessons.filter((l) => l.status === "DRAFT").length;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <header className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-base font-semibold text-brand-ink">
          {initialsFor(tutor.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-ink-subtle">{clock.longDate()}</p>
          <h1 className="text-2xl font-semibold text-ink">
            {t(greetingKey(clock.hour))}, {tutor.name.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {todos.length === 0
              ? t("home.summaryClear")
              : t("home.summary", { n: todos.reduce((n, todo) => n + todo.items.length, 0) })}
            {" · "}
            {t(todaySessions.length === 1 ? "home.todayCountOne" : "home.todayCount", { n: todaySessions.length })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3" aria-labelledby="todo-heading">
          <h2 id="todo-heading" className="font-medium text-ink">
            {t("home.todoTitle")}
          </h2>
          {todos.length === 0 ? (
            <Card className="text-sm text-ink-subtle">{t("home.allClear")}</Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.key} padding="none">
                <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {todo.title}
                    <Badge tone={todo.tone}>{todo.items.length}</Badge>
                  </h3>
                  {todo.items.length > SHOWN_PER_TODO && (
                    <Link href={todo.allHref} className="shrink-0 text-xs font-medium text-brand-ink hover:underline">
                      {t("home.more", { n: todo.items.length - SHOWN_PER_TODO })}
                    </Link>
                  )}
                </div>
                <ul className="divide-y divide-line-soft">
                  {todo.items.slice(0, SHOWN_PER_TODO).map((item) => (
                    <li key={item.key}>
                      <Link href={item.href} className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface-muted">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${badgeColorForKey(item.title)}`}
                        >
                          {initialsFor(item.title)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                          <span className="block truncate text-xs text-ink-subtle">{item.detail}</span>
                        </span>
                        <span aria-hidden className="shrink-0 text-ink-faint">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          )}
        </section>

        <div className="space-y-6">
          <Card padding="none" aria-labelledby="today-heading">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 id="today-heading" className="text-sm font-semibold text-ink">
                {t("home.today")}
              </h2>
              <Link href="/tutor/sessions" className="text-xs font-medium text-brand-ink hover:underline">
                {t("tutor.viewAll")}
              </Link>
            </div>
            {todaySessions.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-subtle">{t("home.noneToday")}</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {todaySessions.map((s) => {
                  const nowOn = s.startTime.getTime() <= nowTime && endOf(s) > nowTime;
                  return (
                    <li key={s.id} className={`flex items-center gap-3 px-5 py-2.5 ${nowOn ? "bg-brand-soft" : ""}`}>
                      <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-ink">{formatSlotTime(s.startTime)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{s.student.name}</span>
                        <span className="block text-xs text-ink-subtle">
                          {nowOn ? t("home.happeningNow") : t("count.minutes", { n: s.durationMinutes })}
                        </span>
                      </span>
                      <StatusBadge status={s.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card padding="none">
            <h2 className="px-5 pb-2 pt-4 text-sm font-semibold text-ink">{t("home.laterThisWeek")}</h2>
            {laterThisWeek.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-subtle">{t("tutor.noUpcoming")}</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {laterThisWeek.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate text-ink">{s.student.name}</span>
                    <span className="shrink-0 text-ink-subtle">{formatSessionTime(s.startTime, language)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-ink">
            {t("tutor.yourCourses")}
            {draftLessons > 0 && (
              <span className="ml-2 text-sm font-normal text-ink-subtle">
                · {t(draftLessons === 1 ? "tutor.chip.draftLessonsOne" : "tutor.chip.draftLessons", { n: draftLessons })}
              </span>
            )}
          </h2>
          <Link href="/tutor/courses" className="text-sm font-medium text-brand-ink hover:underline">
            {t("tutor.manageAllArrow")}
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="rounded-card border border-dashed border-line-strong px-5 py-6 text-center text-sm text-ink-subtle">
            {t("tutor.noCoursesYet")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {courses.map((course, i) => {
              const lessonCount = course.chapters.reduce((n, m) => n + m.lessons.length, 0);
              const published = course.chapters.reduce((n, m) => n + m.lessons.filter((l) => l.status === "PUBLISHED").length, 0);
              return (
                <Link
                  key={course.id}
                  href={`/tutor/courses/${course.id}`}
                  className="flex min-w-0 items-center gap-3 rounded-card border border-line bg-surface p-3 hover:border-brand-line hover:shadow-sm"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold ${badgeColorFor(i)}`}>
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                    <p className="truncate text-xs text-ink-subtle">
                      {t(course._count.enrollments === 1 ? "tutor.publishedOfOne" : "tutor.publishedOf", {
                        done: published,
                        total: lessonCount,
                        students: course._count.enrollments,
                      })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
