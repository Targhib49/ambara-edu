"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { BlockType } from "@/generated/prisma/enums";
import { defaultBlockData, isPreviewableFile, parseBlockData } from "@/lib/blocks/schema";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";

async function lessonEditorPath(lessonId: string) {
  const lesson = await db.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    select: { module: { select: { trackId: true } } },
  });
  return `/tutor/tracks/${lesson.module.trackId}/lessons/${lessonId}`;
}

async function nextBlockOrder(lessonId: string) {
  const last = await db.contentBlock.findFirst({
    where: { lessonId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? -1) + 1;
}

export async function addBlock(lessonId: string, type: Exclude<BlockType, "FILE_ATTACHMENT">) {
  await requireTutor();
  await db.contentBlock.create({
    data: {
      lessonId,
      type,
      order: await nextBlockOrder(lessonId),
      data: defaultBlockData[type],
    },
  });
  revalidatePath(await lessonEditorPath(lessonId));
}

/** One block per file — the input accepts a multi-select so a batch of
 *  handouts can be attached in a single upload. */
export async function addFileBlock(lessonId: string, formData: FormData) {
  await requireTutor();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  const supabase = createSupabaseAdminClient();
  let order = await nextBlockOrder(lessonId);

  for (const file of files) {
    const mimeType = file.type || "application/octet-stream";
    const storagePath = `${lessonId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(storagePath, file, { contentType: mimeType });
    if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);

    await db.contentBlock.create({
      data: {
        lessonId,
        type: "FILE_ATTACHMENT",
        order: order++,
        data: {
          storagePath,
          fileName: file.name,
          mimeType,
          sizeBytes: file.size,
          display: isPreviewableFile({ mimeType, fileName: file.name }) ? "inline" : "download",
        },
      },
    });
  }
  revalidatePath(await lessonEditorPath(lessonId));
}

export async function updateBlock(blockId: string, data: unknown) {
  await requireTutor();
  const block = await db.contentBlock.findUniqueOrThrow({ where: { id: blockId } });
  const parsed = parseBlockData(block.type, data);
  await db.contentBlock.update({ where: { id: blockId }, data: { data: parsed } });
  revalidatePath(await lessonEditorPath(block.lessonId));
}

export async function deleteBlock(blockId: string) {
  await requireTutor();
  const block = await db.contentBlock.delete({ where: { id: blockId } });
  if (block.type === "FILE_ATTACHMENT") {
    const data = block.data as { storagePath?: string };
    if (data.storagePath) {
      const supabase = createSupabaseAdminClient();
      await supabase.storage.from(ATTACHMENTS_BUCKET).remove([data.storagePath]);
    }
  }
  revalidatePath(await lessonEditorPath(block.lessonId));
}

export async function moveBlock(blockId: string, direction: "up" | "down") {
  await requireTutor();
  const block = await db.contentBlock.findUniqueOrThrow({ where: { id: blockId } });
  const neighbor = await db.contentBlock.findFirst({
    where: {
      lessonId: block.lessonId,
      order: direction === "up" ? { lt: block.order } : { gt: block.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.contentBlock.update({ where: { id: block.id }, data: { order: neighbor.order } }),
    db.contentBlock.update({ where: { id: neighbor.id }, data: { order: block.order } }),
  ]);
  revalidatePath(await lessonEditorPath(block.lessonId));
}
