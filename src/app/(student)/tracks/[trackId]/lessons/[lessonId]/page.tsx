import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { BlockRenderer } from "@/components/blocks/renderers";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  const { trackId, lessonId } = await params;
  const student = await requireStudent();

  const lesson = await db.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      module: {
        trackId,
        track: { enrollments: { some: { studentId: student.id } } },
      },
    },
    include: {
      module: { select: { title: true, track: { select: { title: true } } } },
      blocks: { orderBy: { order: "asc" } },
      quizzes: {
        where: { status: "PUBLISHED" },
        select: { id: true, title: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!lesson) notFound();

  // Flattened published-lesson order across the track, for prev/next nav
  const modules = await db.module.findMany({
    where: { trackId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });
  const flat = modules.flatMap((m) => m.lessons);
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "My tracks", href: "/tracks" },
          { label: lesson.module.track.title, href: `/tracks/${trackId}` },
          { label: lesson.title },
        ]}
      />

      <article className="rounded-xl border border-zinc-200 bg-white p-6 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {lesson.module.title}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>

        <div className="mt-6 space-y-5">
          {lesson.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
          {lesson.blocks.length === 0 && (
            <p className="text-sm text-zinc-500">This lesson has no content yet.</p>
          )}
        </div>
      </article>

      {lesson.quizzes.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 font-medium text-zinc-900">Quizzes</h2>
          <ul className="space-y-2">
            {lesson.quizzes.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2.5 text-sm hover:border-blue-300 hover:bg-zinc-50"
                >
                  <span className="font-medium text-zinc-900">{quiz.title}</span>
                  <span className="text-blue-700">Take quiz →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="flex items-stretch justify-between gap-4">
        {prev ? (
          <Link
            href={`/tracks/${trackId}/lessons/${prev.id}`}
            className="max-w-[48%] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 hover:border-blue-400 hover:text-blue-700"
          >
            <span className="block text-xs text-zinc-400">← Previous</span>
            <span className="mt-0.5 block truncate font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/tracks/${trackId}/lessons/${next.id}`}
            className="ml-auto max-w-[48%] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-right text-sm text-zinc-700 hover:border-blue-400 hover:text-blue-700"
          >
            <span className="block text-xs text-zinc-400">Next →</span>
            <span className="mt-0.5 block truncate font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
