import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { DashboardHero } from "@/components/student/DashboardHero";
import { StudentSessionRow } from "@/components/sessions/StudentSessionRow";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";
import { badgeColorForKey } from "@/lib/ui/palette";

export default async function StudentDashboardPage() {
  const student = await requireStudent();

  const [enrollments, submissions, sessions, standaloneQuizzes] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        track: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  where: { status: "PUBLISHED" },
                  orderBy: { order: "asc" },
                  include: {
                    quizzes: { where: { status: "PUBLISHED" }, select: { id: true, title: true } },
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
    db.quiz.findMany({
      where: { lessonId: null, status: "PUBLISHED" },
      select: { id: true, title: true },
    }),
  ]);

  const submittedQuizIds = new Set(submissions.map((s) => s.quizId));

  // --- per-track progress (quiz-based proxy: a lesson counts as done once
  // --- every quiz attached to it has a submission)
  const tracks = enrollments.map(({ track }) => {
    const lessons = track.modules.flatMap((m) => m.lessons);
    const withQuiz = lessons.filter((l) => l.quizzes.length > 0);
    const done = withQuiz.filter((l) => l.quizzes.every((q) => submittedQuizIds.has(q.id)));
    const nextUp = withQuiz.find((l) => !l.quizzes.every((q) => submittedQuizIds.has(q.id)));
    return {
      id: track.id,
      title: track.title,
      lessonCount: lessons.length,
      total: withQuiz.length,
      done: done.length,
      pct: withQuiz.length === 0 ? 0 : Math.round((done.length / withQuiz.length) * 100),
      nextUp: nextUp ? { id: nextUp.id, title: nextUp.title } : null,
    };
  });

  // --- quizzes due (available but never submitted)
  const lessonQuizzesDue = enrollments.flatMap(({ track }) =>
    track.modules.flatMap((m) =>
      m.lessons.flatMap((l) =>
        l.quizzes
          .filter((q) => !submittedQuizIds.has(q.id))
          .map((q) => ({ id: q.id, title: q.title, context: `${track.title} · ${l.title}` }))
      )
    )
  );
  const tryOutsDue = standaloneQuizzes
    .filter((q) => !submittedQuizIds.has(q.id))
    .map((q) => ({ id: q.id, title: q.title, context: "Try-out" }));
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
  const now = Date.now();
  const upcoming = sessions
    .filter((s) => s.startTime.getTime() >= now)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      tutorName: s.tutor.name,
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
    `${tracks.length} track${tracks.length === 1 ? "" : "s"}`,
    `${due.length} kuis menunggu`,
    ...(avgPct !== null ? [`rata-rata nilai ${avgPct}%`] : []),
    `${thisMonth} sesi bulan ini`,
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <DashboardHero name={student.name} chips={chips} />

      {/* metric tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Kuis selesai" value={`${scored.length}`} sub={due.length > 0 ? `${due.length} lagi menunggu` : "semua beres 🎉"} />
        <MetricTile label="Rata-rata nilai" value={avgPct !== null ? `${avgPct}%` : "—"} sub={bestPct !== null ? `terbaik ${bestPct}%` : "belum ada nilai"} />
        <MetricTile
          label="Progres belajar"
          value={progressSummary(tracks)}
          sub="dari materi ber-kuis"
        />
        <MetricTile label="Sesi bulan ini" value={`${thisMonth}`} sub={upcoming.length > 0 ? "lanjutkan terus! 🔥" : "belum ada jadwal"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          {/* track progress */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-medium text-zinc-700">Progres track</h2>
            <div className="mt-4 space-y-5">
              {tracks.map((t) => (
                <div key={t.id}>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/tracks/${t.id}`} className="flex min-w-0 items-start gap-2 font-medium text-zinc-900 hover:underline">
                      <span className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${badgeColorForKey(t.title).split(" ")[0]}`} />
                      <span>{t.title}</span>
                    </Link>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {t.done} / {t.total} materi · {t.pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${t.pct}%` }} />
                  </div>
                  {t.nextUp && (
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Lanjut belajar:{" "}
                      <Link href={`/tracks/${t.id}/lessons/${t.nextUp.id}`} className="text-blue-700 hover:underline">
                        {t.nextUp.title}
                      </Link>
                    </p>
                  )}
                </div>
              ))}
              {tracks.length === 0 && <p className="text-sm text-zinc-500">Belum terdaftar di track manapun.</p>}
            </div>
          </section>

          {/* recent scores + sparkline */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700">Nilai terbaru</h2>
              {scored.length >= 2 && <ScoreSparkline points={scored.map((s) => s.pct)} />}
            </div>
            <ul className="mt-3 divide-y divide-zinc-100">
              {recent.map((s) => (
                <li key={s.quizId} className="flex items-center gap-3 py-2 text-sm">
                  <Link href={`/quizzes/${s.quizId}`} className="min-w-0 flex-1 truncate hover:underline">
                    {s.title}
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[s.status]}`}>
                    {SUBMISSION_STATUS_LABEL[s.status]}
                  </span>
                  <span className="w-20 text-right font-mono font-medium text-zinc-800">
                    {s.score}/{s.total} · {s.pct}%
                  </span>
                </li>
              ))}
              {recent.length === 0 && <p className="py-2 text-sm text-zinc-500">Belum ada kuis yang dikerjakan.</p>}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          {/* quizzes due */}
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="text-sm font-medium text-amber-800">Kuis menunggu ({due.length})</h2>
            <ul className="mt-3 space-y-2">
              {due.slice(0, 5).map((q) => (
                <li key={q.id}>
                  <Link href={`/quizzes/${q.id}`} className="block rounded-lg bg-white px-3 py-2 text-sm shadow-sm hover:shadow">
                    <span className="font-medium text-zinc-900">{q.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{q.context}</span>
                  </Link>
                </li>
              ))}
              {due.length === 0 && <p className="text-sm text-amber-700">Tidak ada — kerja bagus! 🎉</p>}
              {due.length > 5 && (
                <Link href="/quizzes" className="block text-xs text-amber-800 underline">
                  +{due.length - 5} lainnya — lihat semua kuis
                </Link>
              )}
            </ul>
          </section>

          {/* upcoming sessions */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-zinc-700">Sesi berikutnya</h2>
              <Link href="/sessions" className="text-xs text-blue-700 hover:underline">
                Lihat semua →
              </Link>
            </div>
            {upcoming.map((s) => (
              <StudentSessionRow key={s.id} session={s} isPast={false} />
            ))}
            {upcoming.length === 0 && (
              <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                Belum ada sesi terjadwal.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function progressSummary(tracks: { done: number; total: number }[]) {
  const total = tracks.reduce((n, t) => n + t.total, 0);
  const done = tracks.reduce((n, t) => n + t.done, 0);
  return total === 0 ? "—" : `${Math.round((done / total) * 100)}%`;
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

/** Tiny inline sparkline of score percentages over time (oldest → newest). */
function ScoreSparkline({ points }: { points: number[] }) {
  const w = 120;
  const h = 28;
  const step = w / Math.max(points.length - 1, 1);
  const path = points
    .map((p, i) => `${(i * step).toFixed(1)},${(h - 3 - (p / 100) * (h - 6)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-label="Tren nilai" className="text-blue-600">
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={h - 3 - (p / 100) * (h - 6)} r="2" fill="currentColor" />
      ))}
    </svg>
  );
}
