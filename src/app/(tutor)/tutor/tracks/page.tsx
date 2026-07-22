import Link from "next/link";
import { db } from "@/lib/db";
import { createTrack } from "@/lib/actions/tracks";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { badgeColorFor } from "@/lib/ui/palette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function TutorTracksPage() {
  const tracks = await db.track.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Tracks" }]} />
        <h1 className="text-2xl font-semibold">Tracks</h1>
      </div>

      {tracks.length === 0 ? (
        <p className="text-sm text-zinc-500">No tracks yet — create one below.</p>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {tracks.map((track, i) => (
            <Link
              key={track.id}
              href={`/tutor/tracks/${track.id}`}
              className="flex items-start gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-50"
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
              <span className="shrink-0 text-xs text-zinc-400">
                {track._count.modules} modules · {track._count.enrollments} students
              </span>
              <span className="shrink-0 text-zinc-300">›</span>
            </Link>
          ))}
        </div>
      )}

      <form
        action={createTrack}
        className="max-w-md space-y-3 rounded-xl border border-zinc-200 bg-white p-5"
      >
        <h2 className="font-medium">New track</h2>
        <input
          name="title"
          required
          placeholder="Title (e.g. Control Systems)"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Description (optional)"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <SubmitButton
          pendingLabel="Creating…"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Create track
        </SubmitButton>
      </form>
    </div>
  );
}
