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
import { SlideOverButton } from "@/components/ui/SlideOver";
import { NewQuizForm } from "@/components/quiz/NewQuizForm";
import { ClipboardIcon } from "@/components/ui/icons";
import { QuizStyleChip } from "@/components/quiz/QuizStyleField";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";

const BLOCK_LABEL_KEYS = {
  MARKDOWN: "blockType.MARKDOWN",
  EQUATION: "blockType.EQUATION",
  CODE_SNIPPET: "blockType.CODE_SNIPPET",
  FILE_ATTACHMENT: "blockType.FILE_ATTACHMENT",
  CODE_EDITOR: "blockType.CODE_EDITOR",
  VISUALIZATION: "blockType.VISUALIZATION",
  VIDEO_EMBED: "blockType.VIDEO_EMBED",
} as const satisfies Record<string, MessageKey>;

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const t = await getT();
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: { select: { title: true, courseId: true, course: { select: { title: true } } } },
      blocks: { orderBy: { order: "asc" } },
      quizzes: { select: { id: true, title: true, status: true, style: true, _count: { select: { questions: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!lesson || lesson.chapter.courseId !== courseId) notFound();

  // This course's outline, so "Add quiz" starts on this lesson.
  const outline = await db.chapter.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true, title: true, lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
  });
  const tree = [{ id: courseId, title: lesson.chapter.course.title, archived: false, chapters: outline }];

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/tutor" },
            { label: t("nav.courses"), href: "/tutor/courses" },
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
            <SubmitButton pendingLabel={t("lessonEditor.renaming")} className={smallBtn}>
              {t("lessonEditor.rename")}
            </SubmitButton>
          </form>
          <form
            action={setLessonStatus.bind(
              null,
              lesson.id,
              lesson.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
            )}
          >
            <SubmitButton
              pendingLabel={t("lessonEditor.updating")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                lesson.status === "PUBLISHED"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
            >
              {lesson.status === "PUBLISHED" ? t("lessonEditor.unpublish") : t("lessonEditor.publish")}
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {lesson.blocks.map((block, i) => (
          <div key={block.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {t(BLOCK_LABEL_KEYS[block.type])}
              </span>
              <div className="ml-auto flex gap-1.5">
                <form action={moveBlock.bind(null, block.id, "up")}>
                  <SubmitButton pendingLabel="" className={smallBtn} disabled={i === 0} title={t("lessonEditor.moveUp")}>↑</SubmitButton>
                </form>
                <form action={moveBlock.bind(null, block.id, "down")}>
                  <SubmitButton pendingLabel="" className={smallBtn} disabled={i === lesson.blocks.length - 1} title={t("lessonEditor.moveDown")}>↓</SubmitButton>
                </form>
                <form action={deleteBlock.bind(null, block.id)}>
                  <ConfirmButton message={t("lessonEditor.deleteBlockConfirm")} className={`${smallBtn} text-red-600`}>
                    {t("action.delete")}
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <SafeBlockEditor block={block} />
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {t("lessonEditor.previewSaved")}
                </p>
                <BlockRenderer block={block} />
              </div>
            </div>
          </div>
        ))}
        {lesson.blocks.length === 0 && (
          <p className="text-sm text-zinc-500">{t("lessonEditor.noContent")}</p>
        )}
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{t("lessonEditor.quizzesAfter")}</h2>
            <p className="text-xs text-zinc-500">{t("lessonEditor.quizzesAfterHint")}</p>
          </div>
          <SlideOverButton
            variant="small"
            label={t("lessonEditor.addQuiz")}
            title={t("lessonEditor.addQuizTitle")}
            description={lesson.title}
          >
            <NewQuizForm tree={tree} defaultCourseId={courseId} defaultChapterId={lesson.chapterId} defaultLessonId={lesson.id} />
          </SlideOverButton>
        </div>
        {lesson.quizzes.length > 0 && (
          <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
            {lesson.quizzes.map((quiz) => (
              <li key={quiz.id}>
                <Link href={`/tutor/quizzes/${quiz.id}`} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-zinc-50">
                  <ClipboardIcon className="h-4 w-4 shrink-0 text-violet-500" />
                  <span className="min-w-0 flex-1 truncate text-zinc-800">{quiz.title}</span>
                  <QuizStyleChip style={quiz.style} />
                  {quiz.status === "DRAFT" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("status.draft")}</span>}
                  <span className="text-xs tabular-nums text-zinc-500">
                    {t(quiz._count.questions === 1 ? "lessonEditor.questionCount" : "lessonEditor.questionCountPlural", {
                      n: quiz._count.questions,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rounded-xl border border-dashed border-zinc-300 p-4">
        <p className="mb-3 text-sm font-medium text-zinc-600">{t("lessonEditor.addBlock")}</p>
        <div className="flex flex-wrap items-center gap-2">
          {(
            ["MARKDOWN", "EQUATION", "CODE_SNIPPET", "VIDEO_EMBED", "CODE_EDITOR", "VISUALIZATION"] as const
          ).map((type) => (
            <form key={type} action={addBlock.bind(null, lesson.id, type)}>
              <SubmitButton
                pendingLabel={t("action.adding")}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
              >
                + {t(BLOCK_LABEL_KEYS[type])}
              </SubmitButton>
            </form>
          ))}
          <form action={addFileBlock.bind(null, lesson.id)} className="flex items-center gap-2">
            <input type="file" name="file" required multiple className="text-sm" />
            <SubmitButton
              pendingLabel={t("action.uploading")}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
            >
              + {t("blockType.FILE_ATTACHMENT")}
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
async function SafeBlockEditor({ block }: { block: { id: string; type: BlockType; data: unknown } }) {
  const t = await getT();
  let parsed;
  try {
    parsed = toAnyBlock(block);
  } catch {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">{t("lessonEditor.blockUneditable")}</p>
        <p className="mt-1 text-xs">
          {t("lessonEditor.blockUneditableHint1")} <code>{block.type}</code>{" "}
          {t("lessonEditor.blockUneditableHint2")}
        </p>
      </div>
    );
  }
  return <BlockEditor block={parsed} />;
}
