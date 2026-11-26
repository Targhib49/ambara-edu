import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { getLanguage, getT } from "@/lib/i18n/server";
import { ProfileForms } from "@/components/ui/ProfileForms";
import { EmailVerificationCard } from "@/components/student/EmailVerificationCard";
import { StudentSessionRow } from "@/components/sessions/StudentSessionRow";
import { BillingOverview, loadBilling } from "@/components/profile/BillingOverview";
import { StudentSessions } from "@/components/profile/StudentSessions";
import { isEmailConfigured } from "@/lib/email";
import { GRADED_STYLES } from "@/lib/quiz/styles";
import { SUBMISSION_STATUS_BADGE_CLASS, submissionStatusKey } from "@/lib/quiz/format";
import { summarizeCourseProgress } from "@/lib/progress";
import { formatIDR } from "@/lib/billing/money";
import { nowMs } from "@/lib/sessions/format";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { cardCls } from "@/components/ui/styles";

const TABS = ["overview", "sessions", "billing", "progress", "account"] as const;
type TabKey = (typeof TABS)[number];

const BOARD_OPENS_BEFORE_MS = 30 * 60_000;
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

/**
 * The student's one page about themselves: next lesson, what they owe, how
 * they're doing, and their account — the same tabs the tutor sees for them.
 * Sessions and Billing are the very screens behind the sidebar shortcuts.
 */
export default async function StudentProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const student = await requireStudent();
  const t = await getT();
  const { tab: requested } = await searchParams;
  const tab: TabKey = (TABS as readonly string[]).includes(requested ?? "") ? (requested as TabKey) : "overview";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("profile.title") }]}
        title={
          <span className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${badgeColorForKey(student.name)}`}>
              {initialsFor(student.name)}
            </span>
            <span className="min-w-0 truncate">{student.name}</span>
          </span>
        }
        meta={student.email}
      />
      <PageTabs
        active={tab}
        tabs={TABS.map((key) => ({ key, label: t(`profile.tab.${key}`), href: key === "overview" ? "/profile" : `/profile?tab=${key}` }))}
      />

      {tab === "overview" && <Overview studentId={student.id} />}
      {tab === "sessions" && <StudentSessions studentId={student.id} withHeader={false} />}
      {tab === "billing" && (
        <div className="max-w-3xl">
          <BillingOverview studentId={student.id} viewer="student" />
        </div>
      )}
      {tab === "progress" && <Progress studentId={student.id} />}
      {tab === "account" && (
        <div className="space-y-8">
          <ProfileForms name={student.name} email={student.email} />
          {/* With no mailer there is nothing to confirm and nothing to resend, so
              the card would only describe a link that was never sent. */}
          {(isEmailConfigured() || student.emailVerifiedAt) && (
            <EmailVerificationCard email={student.email} verified={student.emailVerifiedAt !== null} />
          )}
        </div>
      )}
    </div>
  );
}

async function loadCourses(studentId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { studentId, course: { status: "PUBLISHED" } },
    orderBy: { createdAt: "asc" },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          chapters: {
            select: {
              lessons: {
                where: { status: "PUBLISHED" },
                select: { id: true, progress: { where: { studentId }, select: { completedAt: true, lastViewedAt: true } } },
              },
            },
          },
        },
      },
    },
  });
  return enrollments.map(({ course }) => ({
    id: course.id,
    title: course.title,
    ...summarizeCourseProgress(course.chapters.flatMap((c) => c.lessons)),
  }));
}

function CourseList({ courses, empty }: { courses: Awaited<ReturnType<typeof loadCourses>>; empty: string }) {
  if (courses.length === 0) return <p className="px-5 pb-5 text-sm text-zinc-500">{empty}</p>;
  return (
    <ul className="divide-y divide-zinc-100">
      {courses.map((c) => (
        <li key={c.id}>
          <Link href={`/courses/${c.id}`} className="block px-5 py-3 hover:bg-zinc-50">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-zinc-900">{c.title}</span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                {c.completed}/{c.total} · {c.pct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${c.pct}%` }} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function SectionHead({ title, href }: { title: string; href?: string }) {
  const t = await getT();
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-blue-700 hover:underline">
          {t("studentPage.viewAll")}
        </Link>
      )}
    </div>
  );
}

async function Overview({ studentId }: { studentId: string }) {
  const t = await getT();
  const language = await getLanguage();
  const now = nowMs();
  const [sessions, billing, courses] = await Promise.all([
    db.session.findMany({
      // Upcoming, plus anything waiting on the student whatever its date.
      where: {
        studentId,
        OR: [
          { startTime: { gte: new Date(now - BOARD_OPENS_BEFORE_MS) }, status: { in: ["CONFIRMED", "PROPOSED"] } },
          { status: { in: ["RESCHEDULE_REQUESTED_BY_TUTOR", "AWAITING_RESCHEDULE"] } },
        ],
      },
      include: { tutor: { select: { name: true } } },
      orderBy: { startTime: "asc" },
      take: 3,
    }),
    loadBilling(studentId, "student"),
    loadCourses(studentId),
  ]);
  const openInvoices = billing.invoices.filter((i) => i.status === "SENT").length;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">{t("profile.nextSession")}</h2>
            <Link href="/profile?tab=sessions" className="text-xs font-medium text-blue-700 hover:underline">
              {t("studentPage.viewAll")}
            </Link>
          </div>
          {sessions.length === 0 ? (
            <div className={`${cardCls} p-5 text-sm text-zinc-500`}>
              {t("studentPage.nothingBooked")} ·{" "}
              <Link href="/profile?tab=sessions" className="font-medium text-blue-700 hover:underline">
                {t("sessions.book")}
              </Link>
            </div>
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

        <section className={cardCls}>
          <SectionHead title={t("profile.currentCourses")} href="/profile?tab=progress" />
          <CourseList courses={courses} empty={t("profile.noCourses")} />
        </section>
      </div>

      <section className={`${cardCls} p-5`}>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("studentBilling.owed")}</p>
        <p className={`mt-1 text-2xl font-semibold ${billing.owed > 0 ? "text-amber-700" : "text-zinc-900"}`}>
          {billing.owed > 0 ? formatIDR(billing.owed, language) : t("studentBilling.settled")}
        </p>
        {openInvoices > 0 && <p className="mt-0.5 text-xs text-zinc-500">{t("profile.openInvoices", { n: openInvoices })}</p>}
        <Link href="/profile?tab=billing" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">
          {t("profile.seeBilling")}
        </Link>
      </section>
    </div>
  );
}

async function Progress({ studentId }: { studentId: string }) {
  const t = await getT();
  const [courses, submissions] = await Promise.all([
    loadCourses(studentId),
    db.submission.findMany({
      // Practice never reaches a score, so only graded styles count here.
      where: { studentId, quiz: { style: { in: GRADED_STYLES } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        status: true,
        autoScore: true,
        manualScore: true,
        updatedAt: true,
        quiz: { select: { id: true, title: true, questions: { select: { points: true } } } },
      },
    }),
  ]);
  const results = submissions.map((s) => {
    const total = s.quiz.questions.reduce((n, q) => n + q.points, 0);
    const score = s.status === "REVIEWED" ? (s.autoScore ?? 0) + (s.manualScore ?? 0) : (s.autoScore ?? 0);
    return { ...s, pct: s.status === "PENDING_REVIEW" || total === 0 ? null : Math.round((score / total) * 100) };
  });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-2">
      <section className={cardCls}>
        <SectionHead title={t("nav.myCourses")} />
        <CourseList courses={courses} empty={t("profile.noCourses")} />
      </section>
      <section className={cardCls}>
        <SectionHead title={t("studentPage.tabQuizResults")} />
        {results.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-zinc-500">{t("studentPage.noQuizzes")}</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {results.map((r) => (
              <li key={r.id}>
                <Link href={`/quizzes/${r.quiz.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{r.quiz.title}</span>
                    <span className="block text-xs text-zinc-500">{dateFmt.format(r.updatedAt)}</span>
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-zinc-700">{r.pct === null ? "—" : `${r.pct}%`}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[r.status]}`}>
                    {t(submissionStatusKey(r.status))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
