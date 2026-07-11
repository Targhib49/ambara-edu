import Link from "next/link";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { nowMs, formatSessionTime } from "@/lib/sessions/format";
import { StatusBadge } from "@/components/sessions/StatusBadge";
import { badgeColorFor, badgeColorForKey, initialsFor } from "@/lib/ui/palette";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
      {children}
    </span>
  );
}

export default async function TutorDashboardPage() {
  const tutor = await requireTutor();
  const now = new Date(nowMs());

  const [tracks, studentCount, sessions] = await Promise.all([
    db.track.findMany({
      where: { ownerId: tutor.id },
      orderBy: { createdAt: "asc" },
      include: {
        modules: { include: { lessons: { select: { status: true } } } },
        _count: { select: { enrollments: true } },
      },
    }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.session.findMany({
      where: { tutorId: tutor.id },
      include: { student: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const needsResponse = sessions.filter((s) => s.status === "RESCHEDULE_REQUESTED_BY_STUDENT");
  const upcoming = sessions.filter((s) => s.status !== "CANCELLED" && s.startTime.getTime() >= now.getTime());
  const nextSession = upcoming[0] ?? null;
  const weekFromNow = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  const sessionsThisWeek = upcoming.filter((s) => s.startTime.getTime() <= weekFromNow).length;

  let draftLessons = 0;
  for (const track of tracks) {
    for (const mod of track.modules) {
      draftLessons += mod.lessons.filter((l) => l.status === "DRAFT").length;
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() + i);
    day.setHours(0, 0, 0, 0);
    const dayStart = day.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const count = sessions.filter(
      (s) => s.status !== "CANCELLED" && s.startTime.getTime() >= dayStart && s.startTime.getTime() < dayEnd
    ).length;
    return { key: dayStart, label: day.toLocaleDateString(undefined, { weekday: "short" }), count };
  });
  const maxDayCount = Math.max(1, ...weekDays.map((d) => d.count));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-blue-800 to-slate-900 p-6 text-white sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-semibold ring-2 ring-white/20">
            {initialsFor(tutor.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-blue-100/80">
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="truncate text-2xl font-semibold">
              {greetingFor(now.getHours())}, {tutor.name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill>{tracks.length} tracks</Pill>
          <Pill>{studentCount} students</Pill>
          <Pill>{sessionsThisWeek} sessions this week</Pill>
          {draftLessons > 0 && (
            <Pill>
              {draftLessons} draft lesson{draftLessons > 1 ? "s" : ""}
            </Pill>
          )}
        </div>
      </div>

      {needsResponse.length > 0 && (
        <Link
          href="/tutor/sessions"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 hover:border-amber-300"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            ⏰
          </span>
          <p className="flex-1 text-sm font-medium text-amber-800">
            {needsResponse.length} reschedule request{needsResponse.length > 1 ? "s" : ""} waiting on you
          </p>
          <span className="shrink-0 text-sm font-medium text-amber-700">Review →</span>
        </Link>
      )}

      {/* Tracks — subject grid */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-zinc-900">Your tracks</h2>
          <Link href="/tutor/tracks" className="text-sm font-medium text-blue-700 hover:underline">
            Manage all →
          </Link>
        </div>
        {tracks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-5 py-6 text-center text-sm text-zinc-500">
            No tracks yet — head to Tracks to create one.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tracks.map((track, i) => {
              const lessonCount = track.modules.reduce((n, m) => n + m.lessons.length, 0);
              const published = track.modules.reduce(
                (n, m) => n + m.lessons.filter((l) => l.status === "PUBLISHED").length,
                0
              );
              return (
                <Link
                  key={track.id}
                  href={`/tutor/tracks/${track.id}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold ${badgeColorFor(i)}`}
                  >
                    {track.title.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{track.title}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {published}/{lessonCount} published · {track._count.enrollments} students
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 font-medium text-zinc-900">This week</h2>
          <div className="flex items-end justify-between gap-2" style={{ height: 72 }}>
            {weekDays.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-t-md ${d.count > 0 ? "bg-blue-500/70" : "bg-zinc-100"}`}
                  style={{ height: `${Math.max(6, (d.count / maxDayCount) * 56)}px` }}
                  title={`${d.count} session${d.count === 1 ? "" : "s"}`}
                />
                <p className="text-[11px] text-zinc-400">{d.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-zinc-900">Upcoming sessions</h2>
            <Link href="/tutor/sessions" className="text-sm font-medium text-blue-700 hover:underline">
              View all →
            </Link>
          </div>

          {nextSession && (
            <div className="mb-3 rounded-lg bg-blue-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Next up</p>
              <p className="mt-0.5 font-medium text-zinc-900">{nextSession.student.name}</p>
              <p className="text-sm text-zinc-600">
                {formatSessionTime(nextSession.startTime)} · {nextSession.durationMinutes} min
              </p>
            </div>
          )}

          {upcoming.length === 0 ? (
            <p className="text-sm text-zinc-500">No upcoming sessions scheduled.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcoming.slice(1, 6).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2 text-sm">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${badgeColorForKey(s.student.name)}`}
                  >
                    {initialsFor(s.student.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{s.student.name}</span>
                  <span className="shrink-0 text-zinc-500">{formatSessionTime(s.startTime)}</span>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
