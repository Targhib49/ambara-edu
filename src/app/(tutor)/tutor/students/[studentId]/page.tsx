import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { ScheduleSessionForm } from "@/components/sessions/ScheduleSessionForm";
import { StatusBadge } from "@/components/sessions/StatusBadge";
import { formatSessionShort, nowMs } from "@/lib/sessions/format";
import { summarizeCourseProgress } from "@/lib/progress";
import { isEnabled } from "@/lib/flags";
import { toLocalParts } from "@/lib/scheduling";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { cardCls } from "@/components/ui/styles";
import { studentOptions } from "@/lib/students/options";
import { courseOptions } from "@/lib/courses/options";
import { SUBMISSION_STATUS_BADGE_CLASS, submissionStatusKey } from "@/lib/quiz/format";
import { getT } from "@/lib/i18n/server";
import { ResetPasswordPanel } from "./ResetPasswordPanel";
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

const GROUP_LABELS = { JUNIOR_HIGH: "Junior high", UNDERGRAD: "Undergrad", GRAD: "Grad" } as const;
const TABS = ["overview", "courses", "quizzes", "sessions"] as const;
type TabKey = (typeof TABS)[number];

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
  const { studentId } = await params;
  const { tab: requestedTab } = await searchParams;
  const tab: TabKey = (TABS as readonly string[]).includes(requestedTab ?? "") ? (requestedTab as TabKey) : "overview";

  const student = await db.user.findFirst({
    where: { id: studentId, role: "STUDENT" },
    select: { id: true, name: true, email: true, studentGroup: true, createdAt: true },
  });
  if (!student) notFound();

  const [enrollments, submissions, sessions, students, courses, schedulingV2] = await Promise.all([
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
      where: { studentId },
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
    isEnabled("scheduling_v2"),
  ]);
  // Sessions reference the student with no cascade, so the database refuses to
  // delete a student who has any. Checked here so the button never offers it.
  const sessionCount = await db.session.count({ where: { studentId } });

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
      scoreLabel: s.status === "PENDING_REVIEW" ? "Awaiting review" : `${score}/${total}`,
      submittedLabel: dateFmt.format(s.updatedAt),
      submittedAt: s.updatedAt.toISOString(),
    };
  });

  const sessionRows: StudentSessionHistoryRow[] = sessions.map((s) => ({
    id: s.id,
    startTime: s.startTime.toISOString(),
    whenLabel: formatSessionShort(s.startTime),
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
  const enrolledIds = new Set(courseRows.map((c) => c.id));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: "Home", href: "/tutor" }, { label: "Students", href: "/tutor/students" }, { label: student.name }]}
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
            {student.email}
            {student.studentGroup && <> · {GROUP_LABELS[student.studentGroup]}</>} · joined {dateFmt.format(student.createdAt)}
          </>
        }
        actions={
          <>
            <SlideOverButton label="Reset password" title={`Reset ${student.name}'s password`} variant="secondary" icon="none">
              <ResetPasswordPanel studentId={student.id} name={student.name} />
            </SlideOverButton>
            <SlideOverButton label="Assign course" title={`Assign a course to ${student.name}`} variant="secondary">
              <AssignCourseForm studentId={student.id} courses={courses.filter((c) => !enrolledIds.has(c.value))} />
            </SlideOverButton>
            <SlideOverButton label="Schedule session" title={`Schedule a session with ${student.name}`} description="All times are WIB.">
              <ScheduleSessionForm students={students} allowWeekly={schedulingV2} today={localDate(new Date(now))} defaultStudentId={student.id} />
            </SlideOverButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Courses" value={String(courseRows.length)} sub={lessonsTotal ? `${lessonsDone} of ${lessonsTotal} lessons done` : "No lessons yet"} />
        <Stat label="Average quiz score" value={avgScore === null ? "—" : `${avgScore}%`} sub={`${graded.length} graded${pendingReview ? ` · ${pendingReview} to review` : ""}`} />
        <Stat label="Sessions attended" value={String(attended)} sub={noShows ? `${noShows} no-show${noShows === 1 ? "" : "s"}` : "No no-shows"} />
        <Stat label="Next session" value={nextSession ? formatSessionShort(nextSession.startTime) : "—"} sub={nextSession ? `${nextSession.durationMinutes} min` : "Nothing booked"} small />
      </div>

      <PageTabs
        active={tab}
        tabs={[
          { key: "overview", label: "Overview", href: base },
          { key: "courses", label: "Courses", href: `${base}?tab=courses`, count: courseRows.length },
          { key: "quizzes", label: "Quiz results", href: `${base}?tab=quizzes`, count: quizRows.length },
          { key: "sessions", label: "Sessions", href: `${base}?tab=sessions`, count: sessionRows.length },
        ]}
      />

      {tab === "overview" && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className={cardCls}>
              <SectionHead title="Course progress" href={`${base}?tab=courses`} />
              {courseRows.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-zinc-500">Not enrolled in any course yet. Use “Assign course” above.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {courseRows.slice(0, 5).map((c) => (
                    <li key={c.id} className="px-5 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link href={`/tutor/courses/${c.id}`} className="truncate text-sm font-medium text-zinc-900 hover:text-blue-700">
                          {c.title}
                        </Link>
                        <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                          {c.completed}/{c.total} · {c.pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${c.pct}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={cardCls}>
              <SectionHead title="Recent quiz results" href={`${base}?tab=quizzes`} />
              {quizRows.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-zinc-500">No quizzes submitted yet.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {quizRows.slice(0, 5).map((q) => (
                    <li key={q.id}>
                      <Link href={`/tutor/quizzes/${q.quizId}/submissions/${q.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-zinc-900">{q.title}</span>
                          <span className="block truncate text-xs text-zinc-500">
                            {q.where || "—"} · {q.submittedLabel}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-zinc-700">{q.pct === null ? "—" : `${q.pct}%`}</span>
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
              <SectionHead title="Sessions" href={`${base}?tab=sessions`} />
              {sessionRows.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-zinc-500">No sessions yet.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {sessionRows.slice(0, 4).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <span className="text-sm text-zinc-700">{s.whenLabel}</span>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={`${cardCls} p-5`}>
              <h2 className="text-sm font-semibold text-zinc-900">Account</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {sessionCount > 0
                  ? `Has ${sessionCount} session${sessionCount === 1 ? "" : "s"} on record, which are kept as part of your teaching history — so this account can't be deleted.`
                  : "Deleting removes their login, enrollments, quiz results and progress."}
              </p>
              <div className="mt-3">
                <DeleteStudentButton studentId={student.id} name={student.name} disabled={sessionCount > 0} />
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "courses" && <StudentCoursesTable studentId={student.id} courses={courseRows} />}
      {tab === "quizzes" && <StudentQuizTable results={quizRows} />}
      {tab === "sessions" && <StudentSessionHistoryTable sessions={sessionRows} />}
    </div>
  );
}

function Stat({ label, value, sub, small }: { label: string; value: string; sub: string; small?: boolean }) {
  return (
    <div className={`${cardCls} p-4`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 font-semibold tabular-nums text-zinc-900 ${small ? "text-base" : "text-2xl"}`}>{value}</p>
      <p className="mt-0.5 truncate text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-4">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <Link href={href} className="text-xs font-medium text-blue-700 hover:underline">
        View all
      </Link>
    </div>
  );
}
