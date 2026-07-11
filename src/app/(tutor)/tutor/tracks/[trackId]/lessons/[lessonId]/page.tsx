import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { renameLesson, setLessonStatus } from "@/lib/actions/lessons";
import { addBlock, addFileBlock, deleteBlock, moveBlock } from "@/lib/actions/blocks";
import { BlockRenderer } from "@/components/blocks/renderers";
import { BlockEditor } from "@/components/blocks/editors";
import { toAnyBlock } from "@/lib/blocks/schema";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";

const BLOCK_LABELS = {
  MARKDOWN: "Markdown",
  EQUATION: "Equation",
  CODE_SNIPPET: "Code snippet",
  FILE_ATTACHMENT: "File attachment",
} as const;

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  const { trackId, lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { select: { title: true, trackId: true, track: { select: { title: true } } } },
      blocks: { orderBy: { order: "asc" } },
      quizzes: { select: { id: true, title: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!lesson || lesson.module.trackId !== trackId) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/tutor" },
            { label: "Tracks", href: "/tutor/tracks" },
            { label: lesson.module.track.title, href: `/tutor/tracks/${trackId}` },
            { label: lesson.title },
          ]}
        />
        <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">{lesson.module.title}</p>
        <div className="mt-1 flex items-center gap-3">
          <form action={renameLesson.bind(null, lesson.id)} className="flex flex-1 gap-2">
            <input
              name="title"
              defaultValue={lesson.title}
              required
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-lg font-semibold focus:border-zinc-500 focus:outline-none"
            />
            <button className={smallBtn}>Rename</button>
          </form>
          <form
            action={setLessonStatus.bind(
              null,
              lesson.id,
              lesson.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
            )}
          >
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                lesson.status === "PUBLISHED"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
            >
              {lesson.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {lesson.blocks.map((block, i) => (
          <div key={block.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {BLOCK_LABELS[block.type]}
              </span>
              <div className="ml-auto flex gap-1.5">
                <form action={moveBlock.bind(null, block.id, "up")}>
                  <button className={smallBtn} disabled={i === 0} title="Move up">↑</button>
                </form>
                <form action={moveBlock.bind(null, block.id, "down")}>
                  <button className={smallBtn} disabled={i === lesson.blocks.length - 1} title="Move down">↓</button>
                </form>
                <form action={deleteBlock.bind(null, block.id)}>
                  <ConfirmButton message="Delete this block?" className={`${smallBtn} text-red-600`}>
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <BlockEditor block={toAnyBlock(block)} />
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Preview (saved state)
                </p>
                <BlockRenderer block={block} />
              </div>
            </div>
          </div>
        ))}
        {lesson.blocks.length === 0 && (
          <p className="text-sm text-zinc-500">No content yet — add a block below.</p>
        )}
      </div>

      {lesson.quizzes.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-zinc-600">Quizzes linked to this lesson</p>
          <ul className="space-y-1.5">
            {lesson.quizzes.map((quiz) => (
              <li key={quiz.id}>
                <Link href={`/tutor/quizzes/${quiz.id}`} className="text-sm text-blue-700 hover:underline">
                  {quiz.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-zinc-300 p-4">
        <p className="mb-3 text-sm font-medium text-zinc-600">Add a block</p>
        <div className="flex flex-wrap items-center gap-2">
          {(["MARKDOWN", "EQUATION", "CODE_SNIPPET"] as const).map((type) => (
            <form key={type} action={addBlock.bind(null, lesson.id, type)}>
              <button className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100">
                + {BLOCK_LABELS[type]}
              </button>
            </form>
          ))}
          <form action={addFileBlock.bind(null, lesson.id)} className="flex items-center gap-2">
            <input type="file" name="file" required className="text-sm" />
            <button className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100">
              + {BLOCK_LABELS.FILE_ATTACHMENT}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
