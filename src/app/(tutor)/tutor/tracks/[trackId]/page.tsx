import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateTrack, deleteTrack, setEnrollment } from "@/lib/actions/tracks";
import { createModule, renameModule, deleteModule, moveModule } from "@/lib/actions/modules";
import { createLesson, deleteLesson, moveLesson, setLessonStatus } from "@/lib/actions/lessons";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";
const inputCls =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const track = await db.track.findUnique({
    where: { id: trackId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      enrollments: { select: { studentId: true } },
    },
  });
  if (!track) notFound();

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });
  const enrolledIds = new Set(track.enrollments.map((e) => e.studentId));

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/tutor" },
            { label: "Tracks", href: "/tutor/tracks" },
            { label: track.title },
          ]}
        />
        <form action={updateTrack.bind(null, track.id)} className="mt-3 max-w-xl space-y-3">
          <input name="title" defaultValue={track.title} required className={`${inputCls} w-full text-lg font-semibold`} />
          <textarea
            name="description"
            defaultValue={track.description}
            rows={2}
            placeholder="Description"
            className={`${inputCls} w-full`}
          />
          <div className="flex gap-2">
            <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Modules & lessons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Modules</h2>
        {track.modules.map((mod, mi) => (
          <div key={mod.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <form action={renameModule.bind(null, mod.id)} className="flex flex-1 gap-2">
                <input name="title" defaultValue={mod.title} required className={`${inputCls} flex-1 font-medium`} />
                <button className={smallBtn}>Rename</button>
              </form>
              <form action={moveModule.bind(null, mod.id, "up")}>
                <button className={smallBtn} disabled={mi === 0} title="Move up">↑</button>
              </form>
              <form action={moveModule.bind(null, mod.id, "down")}>
                <button className={smallBtn} disabled={mi === track.modules.length - 1} title="Move down">↓</button>
              </form>
              <form action={deleteModule.bind(null, mod.id)}>
                <ConfirmButton message={`Delete module "${mod.title}" and all its lessons?`} className={`${smallBtn} text-red-600`}>
                  Delete
                </ConfirmButton>
              </form>
            </div>

            <ul className="mt-3 divide-y divide-zinc-100">
              {mod.lessons.map((lesson, li) => (
                <li key={lesson.id} className="flex items-center gap-2 py-2">
                  <Link
                    href={`/tutor/tracks/${track.id}/lessons/${lesson.id}`}
                    className="flex-1 text-sm hover:underline"
                  >
                    {lesson.title}
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      lesson.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {lesson.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                  <form
                    action={setLessonStatus.bind(
                      null,
                      lesson.id,
                      lesson.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
                    )}
                  >
                    <button className={smallBtn}>
                      {lesson.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={moveLesson.bind(null, lesson.id, "up")}>
                    <button className={smallBtn} disabled={li === 0} title="Move up">↑</button>
                  </form>
                  <form action={moveLesson.bind(null, lesson.id, "down")}>
                    <button className={smallBtn} disabled={li === mod.lessons.length - 1} title="Move down">↓</button>
                  </form>
                  <form action={deleteLesson.bind(null, lesson.id)}>
                    <ConfirmButton message={`Delete lesson "${lesson.title}"?`} className={`${smallBtn} text-red-600`}>
                      Delete
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>

            <form action={createLesson.bind(null, mod.id)} className="mt-2 flex gap-2">
              <input name="title" required placeholder="New lesson title" className={`${inputCls} flex-1`} />
              <button className={smallBtn}>Add lesson</button>
            </form>
          </div>
        ))}

        <form action={createModule.bind(null, track.id)} className="flex max-w-xl gap-2">
          <input name="title" required placeholder="New module title (e.g. Week 3: Bode Plots)" className={`${inputCls} flex-1`} />
          <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
            Add module
          </button>
        </form>
      </section>

      {/* Enrollment */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Enrolled students</h2>
        {students.length === 0 && (
          <p className="text-sm text-zinc-500">
            No students yet — add them on the <Link href="/tutor/students" className="underline">Students</Link> page.
          </p>
        )}
        <ul className="max-w-xl divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white shadow-sm">
          {students.map((student) => {
            const enrolled = enrolledIds.has(student.id);
            return (
              <li key={student.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-zinc-500">{student.email}</p>
                </div>
                {enrolled && <span className="text-xs text-green-600">Enrolled</span>}
                <form action={setEnrollment.bind(null, track.id, student.id, !enrolled)}>
                  <button className={smallBtn}>{enrolled ? "Remove" : "Enroll"}</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <form action={deleteTrack.bind(null, track.id)}>
          <ConfirmButton
            message={`Delete track "${track.title}" including all modules, lessons and content?`}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete this track
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
