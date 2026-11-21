"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { guidedCodeSchema } from "@/lib/blocks/guided";

/**
 * Saves a student's place in a GUIDED_CODE block. Checks run in the browser
 * (the program is compiled by /api/run/cpp), so a passed step is the
 * browser's word for it — fine for practice, which is all this is. The server
 * still keeps it orderly: a step can only be passed after the one before it,
 * never skipped, and only on a block the student can actually see.
 */

const inputSchema = z.object({
  code: z.string().max(20_000),
  /** Steps passed after this save: the current count, or one more when a check just passed. */
  passedSteps: z.number().int().min(0),
});

export async function saveGuidedCode(blockId: string, input: { code: string; passedSteps: number }) {
  const student = await requireStudent();
  const { code, passedSteps } = inputSchema.parse(input);

  const block = await db.contentBlock.findFirst({
    where: {
      id: blockId,
      type: "GUIDED_CODE",
      lesson: {
        status: "PUBLISHED",
        chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } } },
      },
    },
    select: { data: true },
  });
  if (!block) throw new Error("Exercise not found");
  const { steps, starterCode } = guidedCodeSchema.parse(block.data);

  const key = { studentId_blockId: { studentId: student.id, blockId } };
  const existing = await db.guidedCodeProgress.findUnique({ where: key });
  const before = Math.min(existing?.passedSteps ?? 0, steps.length);
  const after = Math.min(passedSteps, steps.length);
  if (after < before || after > before + 1) throw new Error("Steps are passed one at a time");

  const advanced = after > before;
  const completedAt = after === steps.length ? (existing?.completedAt ?? new Date()) : null;
  await db.guidedCodeProgress.upsert({
    where: key,
    create: { studentId: student.id, blockId, code, stepStartCode: advanced ? code : starterCode, passedSteps: after, completedAt },
    update: { code, passedSteps: after, completedAt, ...(advanced ? { stepStartCode: code } : {}) },
  });
  // No revalidate: the block already shows the new state, and the lesson page
  // reads progress fresh on every visit.
}
