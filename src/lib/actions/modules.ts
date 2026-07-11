"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";

export async function createModule(trackId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const last = await db.module.findFirst({
    where: { trackId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await db.module.create({
    data: { trackId, title, order: (last?.order ?? -1) + 1 },
  });
  revalidatePath(`/tutor/tracks/${trackId}`);
}

export async function renameModule(moduleId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const mod = await db.module.update({ where: { id: moduleId }, data: { title } });
  revalidatePath(`/tutor/tracks/${mod.trackId}`);
}

export async function deleteModule(moduleId: string) {
  await requireTutor();
  const mod = await db.module.delete({ where: { id: moduleId } });
  revalidatePath(`/tutor/tracks/${mod.trackId}`);
}

export async function moveModule(moduleId: string, direction: "up" | "down") {
  await requireTutor();
  const mod = await db.module.findUniqueOrThrow({ where: { id: moduleId } });
  const neighbor = await db.module.findFirst({
    where: {
      trackId: mod.trackId,
      order: direction === "up" ? { lt: mod.order } : { gt: mod.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.module.update({ where: { id: mod.id }, data: { order: neighbor.order } }),
    db.module.update({ where: { id: neighbor.id }, data: { order: mod.order } }),
  ]);
  revalidatePath(`/tutor/tracks/${mod.trackId}`);
}
