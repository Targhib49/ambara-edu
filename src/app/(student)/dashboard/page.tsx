import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { DashboardHero } from "@/components/student/DashboardHero";
import { StudentSessionRow } from "@/components/sessions/StudentSessionRow";
import { SUBMISSION_STATUS_BADGE_CLASS, submissionStatusKey } from "@/lib/quiz/format";
import { badgeColorForKey } from "@/lib/ui/palette";
import { cardCls } from "@/components/ui/styles";
import { isEnabled } from "@/lib/flags";
import { summarizeCourseProgress } from "@/lib/progress";
import { nowMs } from "@/lib/sessions/format";
import { getT } from "@/lib/i18n/server";

export default async function StudentDashboardPage() {
  const student = await requireStudent();
  const courseV2 = await isEnabled("course_v2");
  const tr = await getT();

  const [enrollments, submissions, sessions, standaloneQuizzes] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: student.id, course: { status: "PUBLISHED" } },
      include: {
        course: {
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  where: { status: "PUBLISHED" },
                  orderBy: { order: "asc" },
                  include: {
                    quizzes: { where: { status: "PUBLISHED" }, select: { id: true, title: true } },
                    progress: {
                      where: { studentId: student.id },
                      select: { completedAt: true, lastViewedAt: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.submission.findMany({
      where: { studentId: student.id },
      include: { quiz: { select: { id: true, title: true, questions: { select: { points: true } } } } },
      orderBy: { updatedAt: "asc" },
    }),
    db.session.findMany({
      where: { studentId: student.id, status: { not: "CANCELLED" } },
      include: { tutor: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    // Chapter tests in the student's courses (lesson quizzes come from the enrollments above).
    db.quiz.findMany({
      where: {
        lessonId: null,
        status: "PUBLISHED",
        chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } } },
      },
      select: { id: true, title: true, chapter: { select: { title: true, course: { select: { title: true } } } } },
    }),
  ]);

  const submittedQuizIds = new Set(submissions.map((s) => s.quizId));

  // --- per-course progress. With course_v2 this is real lesson completion.
  // Without it, the old proxy stands in: a lesson counts as done once every
  // quiz attached to it has a submission, and lessons with no quiz don't count
  // at all — which is why the number could read 100% with most of a course
  // unread.
  const courses = enrollments.map(({ course }) => {
    const lessons = course.chapters.flatMap((m) => m.lessons);

    if (courseV2) {
      const summary = summarizeCourseProgress(lessons);
      const resume = summary.resumeLessonId
        ? lessons.find((l) => l.id === summary.resumeLessonId)
        : undefined;
      return {
        id: course.id,
        title: course.title,
        lessonCount: lessons.length,
        total: summary.total,
        done: summary.completed,
        pct: summary.pct,
        nextUp: resume ? { id: resume.id, title: resume.title } : null,
      };
    }

    const withQuiz = lessons.filter((l) => l.quizzes.length > 0);
    const done = withQuiz.filter((l) => l.quizzes.every((q) => submittedQuizIds.has(q.id)));
    const nextUp = withQuiz.find((l) => !l.quizzes.every((q) => submittedQuizIds.has(q.id)));
    return {
      id: course.id,
      title: course.title,
      lessonCount: lessons.length,
      total: withQuiz.length,
      done: done.length,
      pct: withQuiz.length === 0 ? 0 : Math.round((done.length / withQuiz.length) * 100),
      nextUp: nextUp ? { id: nextUp.id, title: nextUp.title } : null,
    };
  });

  // --- quizzes due (available but never submitted)
  const lessonQuizzesDue = enrollments.flatMap(({ course }) =>
    course.chapters.flatMap((m) =>
      m.lessons.flatMap((l) =>
        l.quizzes
          .filter((q) => !submittedQuizIds.has(q.id))
          .map((q) => ({ id: q.id, title: q.title, context: `${course.title} · ${l.title}` }))
      )
    )
  );
  const tryOutsDue = standaloneQuizzes
    .filter((q) => !submittedQuizIds.has(q.id))
    .map((q) => ({ id: q.id, title: q.title, context: q.chapter ? `${q.chapter.course.title} · ${q.chapter.title}` : tr("courseEditor.chapterTest") }));
  const due = [...tryOutsDue, ...lessonQuizzesDue];

  // --- scores
  const scored = submissions.map((s) => {
    const total = s.quiz.questions.reduce((n, q) => n + q.points, 0);
    const score = s.status === "REVIEWED" ? (s.autoScore ?? 0) + (s.manualScore ?? 0) : s.autoScore ?? 0;
    return {
      quizId: s.quizId,
      title: s.quiz.title,
      status: s.status,
      score,
      total,
      pct: total > 0 ? Math.round((score / total) * 100) : 0,
      when: s.updatedAt,
    };
  });
  const avgPct = scored.length ? Math.round(scored.reduce((n, s) => n + s.pct, 0) / scored.length) : null;
  const bestPct = scored.length ? Math.max(...scored.map((s) => s.pct)) : null;
  const recent = [...scored].reverse().slice(0, 5);

  // --- sessions
  const now = nowMs();
  const upcoming = sessions
    .filter((s) => s.startTime.getTime() >= now)
    .slice(0, 3)
    .map((s) => ({
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
  const thisMonth = sessions.filter((s) => {
    const d = s.startTime;
    const n = new Date();
    return d.getTime() < now && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  const chips = [
    tr("dash.chip.courses", { n: courses.length }),
    tr("dash.chip.quizzesDue", { n: due.length }),
    ...(avgPct !== null ? [tr("dash.chip.average", { pct: avgPct })] : []),
    tr("dash.chip.sessionsThisMonth", { n: thisMonth }),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <DashboardHero name={student.name} chips={chips} />

      {/* metric tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile
          label={tr("dash.tile.quizzesDone")}
          value={`${scored.length}`}
          sub={due.length > 0 ? tr("dash.tile.quizzesLeft", { n: due.length }) : tr("dash.tile.allDone")}
        />
        <MetricTile
          label={tr("dash.tile.average")}
          value={avgPct !== null ? `${avgPct}%` : "—"}
          sub={bestPct !== null ? tr("dash.tile.best", { pct: bestPct }) : tr("dash.tile.noScores")}
        />
        <MetricTile
          label={tr("dash.tile.progress")}
          value={progressSummary(courses)}
          sub={courseV2 ? tr("dash.tile.progressSub") : tr("dash.tile.progressSubLegacy")}
        />
        <MetricTile
          label={tr("dash.tile.sessionsThisMonth")}
          value={`${thisMonth}`}
          sub={upcoming.length > 0 ? tr("dash.tile.keepGoing") : tr("dash.tile.noSessions")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          {/* course progress */}
          <section className={`${cardCls} p-5`}>
            <h2 className="text-sm font-medium text-zinc-700">{tr("dash.courseProgress")}</h2>
            <div className="mt-4 space-y-5">
              {courses.map((t) => (
                <div key={t.id}>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/courses/${t.id}`} className="flex min-w-0 items-start gap-2 font-medium text-zinc-900 hover:underline">
                      <span className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${badgeColorForKey(t.title).split(" ")[0]}`} />
                      <span>{t.title}</span>
                    </Link>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {tr("dash.materialCount", { done: t.done, total: t.total, pct: t.pct })}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${t.pct}%` }} />
                  </div>
                  {t.nextUp && (
                    <p className="mt-1.5 text-xs text-zinc-500">
                      {tr("dash.continueLearning")}{" "}
                      <Link href={`/courses/${t.id}/lessons/${t.nextUp.id}`} className="text-blue-700 hover:underline">
                        {t.nextUp.title}
                      </Link>
                    </p>
                  )}
                </div>
              ))}
              {courses.length === 0 && <p className="text-sm text-zinc-500">{tr("dash.noCourses")}</p>}
            </div>
          </section>

          {/* recent scores + sparkline */}
          <section className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700">{tr("dash.recentScores")}</h2>
              {scored.length >= 2 && <ScoreSparkline points={scored.map((s) => s.pct)} label={tr("dash.scoreTrend")} />}
            </div>
            <ul className="mt-3 divide-y divide-zinc-100">
              {recent.map((s) => (
                <li key={s.quizId} className="flex items-center gap-3 py-2 text-sm">
                  <Link href={`/quizzes/${s.quizId}`} className="min-w-0 flex-1 truncate hover:underline">
                    {s.title}
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[s.status]}`}>
                    {tr(submissionStatusKey(s.status))}
                  </span>
                  <span className="w-20 text-right font-mono font-medium text-zinc-800">
                    {s.score}/{s.total} · {s.pct}%
                  </span>
                </li>
              ))}
              {recent.length === 0 && <p className="py-2 text-sm text-zinc-500">{tr("dash.noQuizzesYet")}</p>}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          {/* quizzes due */}
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="text-sm font-medium text-amber-800">{tr("dash.quizzesWaiting", { n: due.length })}</h2>
            <ul className="mt-3 space-y-2">
              {due.slice(0, 5).map((q) => (
                <li key={q.id}>
                  <Link href={`/quizzes/${q.id}`} className="block rounded-lg bg-white px-3 py-2 text-sm shadow-sm hover:shadow">
                    <span className="font-medium text-zinc-900">{q.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{q.context}</span>
                  </Link>
                </li>
              ))}
              {due.length === 0 && <p className="text-sm text-amber-700">{tr("dash.nothingWaiting")}</p>}
              {due.length > 5 && (
                <Link href="/quizzes" className="block text-xs text-amber-800 underline">
                  {tr("dash.moreQuizzes", { n: due.length - 5 })}
                </Link>
              )}
            </ul>
          </section>

          {/* upcoming sessions */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-zinc-700">{tr("dash.nextSessions")}</h2>
              <Link href="/sessions" className="text-xs text-blue-700 hover:underline">
                {tr("action.viewAll")} →
              </Link>
            </div>
            {upcoming.map((s) => (
              <StudentSessionRow key={s.id} session={s} isPast={false} />
            ))}
            {upcoming.length === 0 && (
              <p className={`${cardCls} p-4 text-sm text-zinc-500`}>
                {tr("dash.noSessionsScheduled")}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function progressSummary(courses: { done: number; total: number }[]) {
  const total = courses.reduce((n, t) => n + t.total, 0);
  const done = courses.reduce((n, t) => n + t.done, 0);
  return total === 0 ? "—" : `${Math.round((done / total) * 100)}%`;
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className={`${cardCls} p-4`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

/** Tiny inline sparkline of score percentages over time (oldest → newest). */
function ScoreSparkline({ points, label }: { points: number[]; label: string }) {
  const w = 120;
  const h = 28;
  const step = w / Math.max(points.length - 1, 1);
  const path = points
    .map((p, i) => `${(i * step).toFixed(1)},${(h - 3 - (p / 100) * (h - 6)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-label={label} className="text-blue-600">
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={h - 3 - (p / 100) * (h - 6)} r="2" fill="currentColor" />
      ))}
    </svg>
  );
}
