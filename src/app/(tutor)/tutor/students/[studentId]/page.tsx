import Link from "next/link";
import { GRADED_STYLES } from "@/lib/quiz/styles";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { ScheduleSessionForm } from "@/components/sessions/ScheduleSessionForm";
import { StatusBadge } from "@/components/sessions/StatusBadge";
import { formatSessionShort, nowMs } from "@/lib/sessions/format";
import { summarizeCourseProgress } from "@/lib/progress";
import { failedChecksOf } from "@/lib/projects/progress";
import { toLocalParts } from "@/lib/scheduling";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { cardCls } from "@/components/ui/styles";
import { studentOptions } from "@/lib/students/options";
import { courseOptions } from "@/lib/courses/options";
import { SUBMISSION_STATUS_BADGE_CLASS, submissionStatusKey } from "@/lib/quiz/format";
import { getLanguage, getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { ResetPasswordPanel } from "./ResetPasswordPanel";
import { NewInviteLinkPanel, ResetLinkPanel } from "@/components/students/InviteLink";
import { isPlaceholderEmail } from "@/lib/students/placeholder";
import {
  AssignCourseForm,
  DeleteStudentButton,
  StudentCoursesTable,
  StudentQuizTable,
  StudentSessionHistoryTable,
  type StudentCourseRow,
  type StudentQuizResultRow,
  type StudentSessionHistoryRow,
} from "./StudentDetailTables";
import { requireUuids } from "@/lib/params";
import { BillingOverview, loadBilling } from "@/components/profile/BillingOverview";
import { BillingPlanForm, NewInvoiceForm } from "../../billing/billing-ui";
import { formatIDR } from "@/lib/billing/money";
import { describePlan } from "@/lib/billing/text";
import { currentMonth, dateInputValue, todayDate } from "@/lib/billing/period";

const GROUP_LABEL_KEYS = {
  JUNIOR_HIGH: "group.JUNIOR_HIGH",
  UNDERGRAD: "group.UNDERGRAD",
  GRAD: "group.GRAD",
} as const satisfies Record<string, MessageKey>;
const TABS = ["overview", "sessions", "billing", "progress", "account"] as const;
type TabKey = (typeof TABS)[number];
// Older links (and bookmarks) still point at the tabs Progress replaced.
const LEGACY_TABS: Record<string, TabKey> = { courses: "progress", quizzes: "progress" };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

function localDate(instant: Date) {
  const p = toLocalParts(instant);
  return `${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const tutor = await requireTutor();
  const t = await getT();
  const language = await getLanguage();
  const { studentId } = await params;
  requireUuids(studentId);
  const { tab: requestedTab } = await searchParams;
  const tab: TabKey = (TABS as readonly string[]).includes(requestedTab ?? "")
    ? (requestedTab as TabKey)
    : (LEGACY_TABS[requestedTab ?? ""] ?? "overview");

  const student = await db.user.findFirst({
    where: { id: studentId, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      studentGroup: true,
      language: true,
      emailVerifiedAt: true,
      createdAt: true,
      invite: { select: { expiresAt: true } },
    },
  });
  if (!student) notFound();
  const invitePending = isPlaceholderEmail(student.email);

  const [enrollments, submissions, sessions, students, courses, billing] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
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
                  select: { id: true, progress: { where: { studentId }, select: { completedAt: true, lastViewedAt: true } } },
                },
              },
            },
          },
        },
      },
    }),
    db.submission.findMany({
      // Graded styles only: results left on a quiz since switched to practice don't count.
      where: { studentId, quiz: { style: { in: GRADED_STYLES } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        status: true,
        autoScore: true,
        manualScore: true,
        updatedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            questions: { select: { points: true } },
            lesson: { select: { title: true } },
            chapter: { select: { title: true, course: { select: { title: true } } } },
          },
        },
      },
    }),
    db.session.findMany({
      where: { studentId, tutorId: tutor.id },
      orderBy: { startTime: "desc" },
      select: { id: true, startTime: true, durationMinutes: true, status: true, attendance: true, notes: true, statusReason: true },
    }),
    studentOptions(),
    courseOptions(),
    loadBilling(studentId, "tutor"),
  ]);
  // Sessions reference the student with no cascade, so the database refuses to
  // delete a student who has any. Checked here so the button never offers it.
  const sessionCount = await db.session.count({ where: { studentId } });

  // Guided projects the student has started but not finished. A finished one
  // is a submission, listed with the quiz results; until then this is the only
  // place on the student's page that shows it.
  const openProjects = (
    await db.projectProgress.findMany({
      where: { studentId, completedAt: null, quiz: { status: "PUBLISHED" } },
      orderBy: { updatedAt: "desc" },
      select: {
        passedIds: true,
        failedChecks: true,
        updatedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            chapter: { select: { title: true, course: { select: { title: true } } } },
            _count: { select: { questions: { where: { type: "PROJECT_STEP" } } } },
          },
        },
      },
    })
  ).map((p) => ({
    quizId: p.quiz.id,
    title: p.quiz.title,
    where: [p.quiz.chapter?.course.title, p.quiz.chapter?.title].filter(Boolean).join(" › "),
    passed: Math.min(Array.isArray(p.passedIds) ? p.passedIds.length : 0, p.quiz._count.questions),
    total: p.quiz._count.questions,
    failed: Object.values(failedChecksOf(p.failedChecks)).reduce((n, f) => n + f, 0),
    updatedLabel: dateFmt.format(p.updatedAt),
  }));

  const now = nowMs();

  const courseRows: StudentCourseRow[] = enrollments.map((e) => {
    const progress = summarizeCourseProgress(e.course.chapters.flatMap((c) => c.lessons));
    return {
      id: e.course.id,
      title: e.course.title,
      completed: progress.completed,
      total: progress.total,
      pct: progress.pct,
      enrolledLabel: dateFmt.format(e.createdAt),
    };
  });

  const quizRows: StudentQuizResultRow[] = submissions.map((s) => {
    const total = s.quiz.questions.reduce((n, q) => n + q.points, 0);
    const score = s.status === "REVIEWED" ? (s.autoScore ?? 0) + (s.manualScore ?? 0) : s.autoScore ?? 0;
    const where = [s.quiz.chapter?.course.title, s.quiz.chapter?.title, s.quiz.lesson?.title].filter(Boolean).join(" › ");
    return {
      id: s.id,
      quizId: s.quiz.id,
      title: s.quiz.title,
      where,
      status: s.status,
      pct: s.status === "PENDING_REVIEW" || total === 0 ? null : Math.round((score / total) * 100),
      scoreLabel: s.status === "PENDING_REVIEW" ? t("studentPage.awaitingReview") : `${score}/${total}`,
      submittedLabel: dateFmt.format(s.updatedAt),
      submittedAt: s.updatedAt.toISOString(),
    };
  });

  const sessionRows: StudentSessionHistoryRow[] = sessions.map((s) => ({
    id: s.id,
    startTime: s.startTime.toISOString(),
    whenLabel: formatSessionShort(s.startTime, language),
    durationMinutes: s.durationMinutes,
    status: s.status,
    attendance: s.attendance,
    notes: s.status === "CANCELLED" || s.status === "AWAITING_RESCHEDULE" ? (s.statusReason ?? "") : s.notes,
  }));

  const lessonsDone = courseRows.reduce((n, c) => n + c.completed, 0);
  const lessonsTotal = courseRows.reduce((n, c) => n + c.total, 0);
  const graded = quizRows.filter((q) => q.pct !== null);
  const avgScore = graded.length ? Math.round(graded.reduce((n, q) => n + (q.pct ?? 0), 0) / graded.length) : null;
  const attended = sessions.filter((s) => s.status === "COMPLETED" && s.attendance === "ATTENDED").length;
  const noShows = sessions.filter((s) => s.status === "COMPLETED" && s.attendance === "NO_SHOW").length;
  const nextSession = [...sessions]
    .reverse()
    .find((s) => s.startTime.getTime() >= now && (s.status === "CONFIRMED" || s.status === "PROPOSED"));
  const pendingReview = quizRows.filter((q) => q.status === "PENDING_REVIEW").length;

  const base = `/tutor/students/${student.id}`;
  const projectsCard = openProjects.length > 0 && (
    <section className={cardCls}>
                <SectionHead title={t("studentPage.openProjects")} />
                <ul className="divide-y divide-line-soft">
                  {openProjects.map((p) => (
                    <li key={p.quizId}>
                      <Link href={`/tutor/quizzes/${p.quizId}`} className="block px-5 py-3 hover:bg-surface-muted">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-medium text-ink">{p.title}</span>
                          <span className="shrink-0 text-xs tabular-nums text-ink-subtle">
                            {t("projectProgress.steps", { n: p.passed, total: p.total })}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-ink-subtle">
                          {p.where || "—"} · {t("projectProgress.failed", { n: p.failed })} · {t("studentPage.lastActive", { date: p.updatedLabel })}
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${p.total ? (p.passed / p.total) * 100 : 0}%` }} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
  );
  const enrolledIds = new Set(courseRows.map((c) => c.id));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("nav.students"), href: "/tutor/students" }, { label: student.name }]}
        title={
          <span className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${badgeColorForKey(student.name)}`}>
              {initialsFor(student.name)}
            </span>
            <span className="min-w-0 truncate">{student.name}</span>
          </span>
        }
        meta={
          <>
            {invitePending ? <span className="text-warning-ink">{t("students.invitePending")}</span> : student.email}
            {student.studentGroup && <> · {t(GROUP_LABEL_KEYS[student.studentGroup])}</>} ·{" "}
            {t("studentPage.joined", { date: dateFmt.format(student.createdAt) })}
          </>
        }
        actions={
          <>
            <SlideOverButton
              label={t("studentDetail.assignCourse")}
              title={t("studentPage.assignCourseTitle", { name: student.name })}
              variant="secondary"
            >
              <AssignCourseForm studentId={student.id} courses={courses.filter((c) => !enrolledIds.has(c.value))} />
            </SlideOverButton>
            <SlideOverButton
              label={t("studentPage.scheduleSession")}
              title={t("studentPage.scheduleSessionTitle", { name: student.name })}
              description={t("studentPage.wibNote")}
            >
              <ScheduleSessionForm students={students} courses={courses} today={localDate(new Date(now))} defaultStudentId={student.id} />
            </SlideOverButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t("studentPage.statCourses")}
          value={String(courseRows.length)}
          sub={lessonsTotal ? t("studentPage.lessonsDone", { done: lessonsDone, total: lessonsTotal }) : t("studentPage.noLessonsYet")}
        />
        <Stat
          label={t("studentPage.statAvgScore")}
          value={avgScore === null ? "—" : `${avgScore}%`}
          sub={`${t("studentPage.graded", { n: graded.length })}${pendingReview ? ` · ${t("studentPage.toReview", { n: pendingReview })}` : ""}`}
        />
        <Stat
          label={t("studentPage.statAttended")}
          value={String(attended)}
          sub={noShows ? t(noShows === 1 ? "studentPage.noShow" : "studentPage.noShows", { n: noShows }) : t("studentPage.noNoShows")}
        />
        <Stat
          label={t("studentPage.statNextSession")}
          value={nextSession ? formatSessionShort(nextSession.startTime, language) : "—"}
          sub={nextSession ? t("count.minutes", { n: nextSession.durationMinutes }) : t("studentPage.nothingBooked")}
          small
        />
      </div>

      <PageTabs
        active={tab}
        tabs={[
          { key: "overview", label: t("profile.tab.overview"), href: base },
          { key: "sessions", label: t("profile.tab.sessions"), href: `${base}?tab=sessions`, count: sessionRows.length },
          { key: "billing", label: t("profile.tab.billing"), href: `${base}?tab=billing` },
          { key: "progress", label: t("profile.tab.progress"), href: `${base}?tab=progress`, count: pendingReview || undefined },
          { key: "account", label: t("profile.tab.account"), href: `${base}?tab=account` },
        ]}
      />

      {tab === "overview" && (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className={cardCls}>
              <SectionHead title={t("studentPage.courseProgress")} href={`${base}?tab=progress`} />
              {courseRows.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-ink-subtle">{t("studentPage.noCourses")}</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {courseRows.slice(0, 5).map((c) => (
                    <li key={c.id} className="px-5 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link href={`/tutor/courses/${c.id}`} className="truncate text-sm font-medium text-ink hover:text-brand-ink">
                          {c.title}
                        </Link>
                        <span className="shrink-0 text-xs tabular-nums text-ink-subtle">
                          {c.completed}/{c.total} · {c.pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${c.pct}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {projectsCard}

            <section className={cardCls}>
              <SectionHead title={t("studentPage.recentQuizResults")} href={`${base}?tab=progress`} />
              {quizRows.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-ink-subtle">{t("studentPage.noQuizzes")}</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {quizRows.slice(0, 5).map((q) => (
                    <li key={q.id}>
                      <Link href={`/tutor/quizzes/${q.quizId}/submissions/${q.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{q.title}</span>
                          <span className="block truncate text-xs text-ink-subtle">
                            {q.where || "—"} · {q.submittedLabel}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-ink-soft">{q.pct === null ? "—" : `${q.pct}%`}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[q.status]}`}>
                          {t(submissionStatusKey(q.status))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className={cardCls}>
              <SectionHead title={t("nav.sessions")} href={`${base}?tab=sessions`} />
              {sessionRows.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-ink-subtle">{t("studentPage.noSessions")}</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {sessionRows.slice(0, 4).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <span className="text-sm text-ink-soft">{s.whenLabel}</span>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {invitePending && (
              <section className={`${cardCls} border-warning-line bg-warning-wash/60 p-5`}>
                <h2 className="text-sm font-semibold text-warning-ink">{t("students.invitePending")}</h2>
                <p className="mt-1 text-sm text-warning-ink/80">{t("profile.inviteHint", { name: student.name })}</p>
                <div className="mt-3">
                  <SlideOverButton label={t("invite.newLink")} title={t("invite.newLinkTitle", { name: student.name })} variant="secondary" icon="none">
                    <NewInviteLinkPanel studentId={student.id} name={student.name} />
                  </SlideOverButton>
                </div>
              </section>
            )}

            <section className={cardCls}>
              <SectionHead title={t("profile.tab.billing")} href={`${base}?tab=billing`} />
              <div className="px-5 pb-5">
                <p className={`text-xl font-semibold ${billing.owed > 0 ? "text-warning-ink" : "text-ink"}`}>
                  {billing.owed > 0 ? formatIDR(billing.owed, language) : t("studentBilling.settled")}
                </p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {billing.plans.length > 0
                    ? billing.plans.map((p) => describePlan(t, language, p)).join(" · ")
                    : t("profile.noPlan")}
                </p>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "sessions" && <StudentSessionHistoryTable sessions={sessionRows} />}

      {tab === "billing" && (
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <SlideOverButton label={t("billing.plan.set")} title={t("billing.plan.set")} variant="secondary" icon="none">
              <BillingPlanForm studentId={student.id} courses={courses} defaultDate={dateInputValue(todayDate())} />
            </SlideOverButton>
            <SlideOverButton label={t("billing.newInvoice")} title={t("billing.newInvoice")}>
              <NewInvoiceForm studentId={student.id} defaultMonth={currentMonth()} />
            </SlideOverButton>
          </div>
          <BillingOverview studentId={student.id} viewer="tutor" />
        </div>
      )}

      {tab === "progress" && (
        <div className="space-y-6">
          {projectsCard}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-ink">{t("nav.courses")}</h2>
            <StudentCoursesTable studentId={student.id} courses={courseRows} />
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-ink">{t("studentPage.tabQuizResults")}</h2>
            <StudentQuizTable results={quizRows} />
          </section>
        </div>
      )}

      {tab === "account" && (
        <div className="grid max-w-4xl grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-2">
          <section className={`${cardCls} p-5`}>
            <h2 className="text-sm font-semibold text-ink">{t("profile.accountDetails")}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">{t("createStudent.email")}</dt>
                <dd className="min-w-0 truncate text-right text-ink">
                  {invitePending ? <span className="text-warning-ink">{t("students.notJoinedYet")}</span> : student.email}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">{t("students.header.email")}</dt>
                <dd className="text-right text-ink">
                  {invitePending ? "—" : student.emailVerifiedAt ? t("students.verified") : t("students.pending")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">{t("createStudent.group")}</dt>
                <dd className="text-right text-ink">{student.studentGroup ? t(GROUP_LABEL_KEYS[student.studentGroup]) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">{t("profile.language")}</dt>
                <dd className="text-right text-ink">{student.language === "EN" ? "English" : "Bahasa Indonesia"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-subtle">{t("profile.added")}</dt>
                <dd className="text-right text-ink">{dateFmt.format(student.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <div className="space-y-6">
            <section className={`${cardCls} p-5`}>
              <h2 className="text-sm font-semibold text-ink">{t("profile.signIn")}</h2>
              <p className="mt-1 text-sm text-ink-subtle">
                {invitePending
                  ? student.invite && student.invite.expiresAt > new Date(now)
                    ? t("profile.inviteActive", { date: dateFmt.format(student.invite.expiresAt) })
                    : t("profile.inviteExpired")
                  : t("profile.resetHint")}
              </p>
              <div className="mt-3">
                {invitePending ? (
                  <SlideOverButton label={t("invite.newLink")} title={t("invite.newLinkTitle", { name: student.name })} variant="secondary" icon="none">
                    <NewInviteLinkPanel studentId={student.id} name={student.name} />
                  </SlideOverButton>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <SlideOverButton
                      label={t("resetLink.create")}
                      title={t("resetLink.title", { name: student.name })}
                      variant="secondary"
                      icon="none"
                    >
                      <ResetLinkPanel studentId={student.id} name={student.name} />
                    </SlideOverButton>
                    {/* The old way, for when a link can't reach them in time (say, mid-session). */}
                    <SlideOverButton
                      label={t("resetLink.tempInstead")}
                      title={t("studentPage.resetPasswordTitle", { name: student.name })}
                      variant="small"
                      icon="none"
                    >
                      <ResetPasswordPanel studentId={student.id} name={student.name} />
                    </SlideOverButton>
                  </div>
                )}
              </div>
            </section>

            <section className={`${cardCls} p-5`}>
              <h2 className="text-sm font-semibold text-ink">{t("profile.deleteTitle")}</h2>
              <p className="mt-1 text-sm text-ink-subtle">
                {sessionCount > 0
                  ? t(sessionCount === 1 ? "studentPage.deleteBlocked" : "studentPage.deleteBlockedPlural", { n: sessionCount })
                  : t("studentPage.deleteHint")}
              </p>
              <div className="mt-3">
                <DeleteStudentButton studentId={student.id} name={student.name} disabled={sessionCount > 0} />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, small }: { label: string; value: string; sub: string; small?: boolean }) {
  return (
    <div className={`${cardCls} p-4`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className={`mt-1 font-semibold tabular-nums text-ink ${small ? "text-base" : "text-2xl"}`}>{value}</p>
      <p className="mt-0.5 truncate text-xs text-ink-subtle">{sub}</p>
    </div>
  );
}

async function SectionHead({ title, href }: { title: string; href?: string }) {
  const t = await getT();
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-4">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-brand-ink hover:underline">
          {t("studentPage.viewAll")}
        </Link>
      )}
    </div>
  );
}
