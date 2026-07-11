import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { badgeColorFor } from "@/lib/ui/palette";

export default async function StudentTracksPage() {
  const student = await requireStudent();
  const tracks = await db.track.findMany({
    where: { enrollments: { some: { studentId: student.id } } },
    orderBy: { title: "asc" },
    include: {
      modules: {
        select: { lessons: { where: { status: "PUBLISHED" }, select: { id: true } } },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">My tracks</h1>
      {tracks.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          You aren’t enrolled in any tracks yet — your tutor will add you.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {tracks.map((track, i) => {
            const lessonCount = track.modules.reduce((n, m) => n + m.lessons.length, 0);
            return (
              <Link
                key={track.id}
                href={`/tracks/${track.id}`}
                className="flex items-center gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-50"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold ${badgeColorFor(i)}`}
                >
                  {track.title.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-zinc-900">{track.title}</h2>
                  {track.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">{track.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{lessonCount} lessons</span>
                <span className="shrink-0 text-zinc-300">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
