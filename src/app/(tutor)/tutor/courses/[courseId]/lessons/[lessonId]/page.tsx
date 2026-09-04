import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { renameLesson, setLessonStatus } from "@/lib/actions/lessons";
import { addBlock, addFileBlock, deleteBlock, moveBlock } from "@/lib/actions/blocks";
import { BlockRenderer } from "@/components/blocks/renderers";
import { BlockEditor } from "@/components/blocks/editors";
import { toAnyBlock } from "@/lib/blocks/schema";
import type { BlockType } from "@/generated/prisma/enums";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";

const BLOCK_LABELS = {
  MARKDOWN: "Markdown",
  EQUATION: "Equation",
  CODE_SNIPPET: "Code snippet",
  FILE_ATTACHMENT: "File attachment",
  CODE_EDITOR: "Python scratchpad",
  VISUALIZATION: "Visualization",
  VIDEO_EMBED: "Video",
} as const;

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: { select: { title: true, courseId: true, course: { select: { title: true } } } },
      blocks: { orderBy: { order: "asc" } },
      quizzes: { select: { id: true, title: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!lesson || lesson.chapter.courseId !== courseId) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/tutor" },
            { label: "Courses", href: "/tutor/courses" },
            { label: lesson.chapter.course.title, href: `/tutor/courses/${courseId}` },
            { label: lesson.title },
          ]}
        />
        <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">{lesson.chapter.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <form action={renameLesson.bind(null, lesson.id)} className="flex min-w-0 flex-1 gap-2">
            <input
              name="title"
              defaultValue={lesson.title}
              required
              className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-lg font-semibold focus:border-zinc-500 focus:outline-none"
            />
            <SubmitButton pendingLabel="Renaming…" className={smallBtn}>Rename</SubmitButton>
          </form>
          <form
            action={setLessonStatus.bind(
              null,
              lesson.id,
              lesson.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
            )}
          >
            <SubmitButton
              pendingLabel="Updating…"
              className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                lesson.status === "PUBLISHED"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
            >
              {lesson.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </SubmitButton>
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
              <SafeBlockEditor block={block} />
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
          {(
            ["MARKDOWN", "EQUATION", "CODE_SNIPPET", "VIDEO_EMBED", "CODE_EDITOR", "VISUALIZATION"] as const
          ).map((type) => (
            <form key={type} action={addBlock.bind(null, lesson.id, type)}>
              <SubmitButton
                pendingLabel="Adding…"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
              >
                + {BLOCK_LABELS[type]}
              </SubmitButton>
            </form>
          ))}
          <form action={addFileBlock.bind(null, lesson.id)} className="flex items-center gap-2">
            <input type="file" name="file" required multiple className="text-sm" />
            <SubmitButton
              pendingLabel="Uploading…"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
            >
              + {BLOCK_LABELS.FILE_ATTACHMENT}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}


/**
 * `toAnyBlock` throws on a payload this build's Zod schemas don't recognise —
 * which happens whenever the DB holds a block type or visualization component
 * newer than the running code (a not-yet-deployed feature, or a rollback).
 * Unguarded, that throw takes down the whole editor page rather than the one
 * block, so the tutor can't even reach the Delete button to fix it.
 */
function SafeBlockEditor({ block }: { block: { id: string; type: BlockType; data: unknown } }) {
  let parsed;
  try {
    parsed = toAnyBlock(block);
  } catch {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">This block can’t be edited by this version of the app.</p>
        <p className="mt-1 text-xs">
          Its saved data doesn’t match any known <code>{block.type}</code> shape — usually a block
          created by a newer deploy. Deploying the matching code restores it; deleting it here is safe
          if you no longer need it.
        </p>
      </div>
    );
  }
  return <BlockEditor block={parsed} />;
}
