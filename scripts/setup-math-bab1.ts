/**
 * Replaces Intermediate Math · Bab 1 with the book-style remake (PDF lessons +
 * new Latihan Mandiri quizzes) defined in scripts/content/math-bab1.ts.
 *
 *   npx tsx scripts/setup-math-bab1.ts validate   offline: content parses against the app's Zod schemas, PDFs exist
 *   npx tsx scripts/setup-math-bab1.ts plan       read-only: prints the live chapter and what apply would change
 *   npx tsx scripts/setup-math-bab1.ts apply      backs up the chapter to JSON, then rewrites it
 *
 * The DB is shared with production and students are enrolled, so apply never
 * deletes anything a student produced:
 *   - existing lesson rows are REUSED in order (Sesi 1..6), keeping LessonProgress; only title + blocks change
 *   - old lesson-linked quizzes are archived (DRAFT, "[Arsip] " title, detached from the lesson),
 *     never deleted, so submissions and score history survive
 *   - chapter-level quizzes (the Try Out) are left untouched
 *   - each new quiz takes the publish status of the quiz it replaces (DRAFT if there was none)
 * Old MARKDOWN blocks are deleted after being written to the backup file.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { correctAnswerSchemas } from "../src/lib/quiz/schema";
import { CHAPTER_TITLE, SESI, type BlockSpec, type QuestionSpec } from "./content/math-bab1";

const BOOK_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku");
const BACKUP_DIR = path.join(BOOK_DIR, "backups");
const BUCKET = "attachments";
const COURSE_TITLE_MATCH = "Intermediate Math";

const mode = process.argv[2] ?? "plan";

function pdfPath(dir: string) {
  return path.join(BOOK_DIR, dir, `${dir}.pdf`);
}

function questionRow(q: QuestionSpec) {
  switch (q.type) {
    case "MULTIPLE_CHOICE":
      return { options: q.options, correctAnswer: correctAnswerSchemas.MULTIPLE_CHOICE.parse({ letter: q.answer }) };
    case "MULTI_SELECT":
      return { options: q.options, correctAnswer: correctAnswerSchemas.MULTI_SELECT.parse({ letters: q.answer }) };
    case "NUMERIC":
      return { options: [], correctAnswer: correctAnswerSchemas.NUMERIC.parse({ value: q.answer, tolerance: 0 }) };
    case "CODE":
      return { options: [], correctAnswer: correctAnswerSchemas.CODE.parse({ testCases: q.tests }) };
  }
}

function blockData(b: BlockSpec, uploaded?: { storagePath: string; sizeBytes: number }) {
  switch (b.type) {
    case "MARKDOWN":
      return { type: "MARKDOWN" as const, data: blockDataSchemas.MARKDOWN.parse({ markdown: b.markdown }) };
    case "CODE_EDITOR":
      return { type: "CODE_EDITOR" as const, data: blockDataSchemas.CODE_EDITOR.parse({ starterCode: b.starterCode }) };
    case "PDF":
      return {
        type: "FILE_ATTACHMENT" as const,
        data: blockDataSchemas.FILE_ATTACHMENT.parse({
          storagePath: uploaded?.storagePath ?? "pending/upload.pdf",
          fileName: b.fileName,
          mimeType: "application/pdf",
          sizeBytes: uploaded?.sizeBytes ?? fs.statSync(pdfPath(b.dir)).size,
          display: "inline",
        }),
      };
  }
}

/** Offline checks: every block and answer parses, options are A–D sized, PDFs exist, points follow house tiers. */
function validate() {
  const problems: string[] = [];
  for (const s of SESI) {
    for (const b of s.blocks) {
      if (b.type === "PDF" && !fs.existsSync(pdfPath(b.dir))) problems.push(`${s.title}: missing ${pdfPath(b.dir)}`);
      try {
        blockData(b);
      } catch (e) {
        problems.push(`${s.title}: block ${b.type} invalid: ${(e as Error).message}`);
      }
    }
    s.quiz.questions.forEach((q, i) => {
      try {
        questionRow(q);
      } catch (e) {
        problems.push(`${s.quiz.title} #${i + 1}: ${(e as Error).message}`);
      }
      if ((q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") && (q.options.length < 2 || q.options.length > 4))
        problems.push(`${s.quiz.title} #${i + 1}: needs 2–4 options`);
      const letters = q.type === "MULTIPLE_CHOICE" ? [q.answer] : q.type === "MULTI_SELECT" ? q.answer : [];
      for (const l of letters)
        if ("ABCD".indexOf(l) >= (q as { options: string[] }).options.length) problems.push(`${s.quiz.title} #${i + 1}: answer ${l} out of range`);
      const tier = q.prompt.match(/^\[(Dasar|Menengah|Tantangan)\]/)?.[1];
      if (!tier) problems.push(`${s.quiz.title} #${i + 1}: prompt lacks [Dasar]/[Menengah]/[Tantangan] tag`);
      const expected = { Dasar: [1], Menengah: [2], Tantangan: [3, 4] }[tier ?? "Dasar"]!;
      if (!expected.includes(q.points)) problems.push(`${s.quiz.title} #${i + 1}: ${tier} worth ${q.points} pts`);
      if (q.type === "CODE")
        for (const t of q.tests)
          if (t.expectedOutput !== t.expectedOutput.replace(/[ \t]+$/gm, "").replace(/\n+$/, ""))
            problems.push(`${s.quiz.title} #${i + 1}: expectedOutput not stable under output normalisation`);
    });
  }
  for (const s of SESI) {
    const pts = s.quiz.questions.reduce((n, q) => n + q.points, 0);
    const pdf = s.blocks.find((b): b is Extract<BlockSpec, { type: "PDF" }> => b.type === "PDF");
    const size = pdf && fs.existsSync(pdfPath(pdf.dir)) ? `${(fs.statSync(pdfPath(pdf.dir)).size / 1024).toFixed(0)} KB` : "?";
    console.log(`  ${s.title.padEnd(62)} ${String(s.blocks.length).padStart(2)} blocks · PDF ${size.padStart(7)} · ${s.quiz.questions.length} soal / ${pts} poin`);
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
  console.log("\n✓ content valid");
}

async function main() {
  if (mode === "validate") return validate();
  if (mode !== "plan" && mode !== "apply") throw new Error(`unknown mode "${mode}" — use validate | plan | apply`);
  validate();

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const courses = await db.course.findMany({
      where: { title: { contains: COURSE_TITLE_MATCH, mode: "insensitive" } },
      include: { chapters: { orderBy: { order: "asc" } } },
    });
    if (courses.length !== 1) throw new Error(`expected exactly one course matching "${COURSE_TITLE_MATCH}", found ${courses.length}`);
    const course = courses[0];
    const chapter = course.chapters.find((c) => /^bab\s*1\b/i.test(c.title)) ?? course.chapters[0];
    if (!chapter) throw new Error("course has no chapters");

    const lessons = await db.lesson.findMany({
      where: { chapterId: chapter.id },
      orderBy: { order: "asc" },
      include: {
        blocks: { orderBy: { order: "asc" } },
        quizzes: { include: { _count: { select: { submissions: true, questions: true } } } },
        _count: { select: { progress: true } },
      },
    });
    const chapterTests = await db.quiz.findMany({
      where: { chapterId: chapter.id, lessonId: null },
      include: { _count: { select: { submissions: true, questions: true } } },
    });

    console.log(`\nCourse  ${course.title} (${course.status})`);
    console.log(`Chapter ${chapter.title}  →  ${CHAPTER_TITLE}`);
    lessons.forEach((l, i) => {
      console.log(`  [${i}] ${l.status.padEnd(9)} ${l.title}  (${l.blocks.length} blocks, ${l._count.progress} progress rows)`);
      for (const q of l.quizzes)
        console.log(`        quiz ${q.status.padEnd(9)} ${q.title}  (${q._count.questions} soal, ${q._count.submissions} submissions) → archive`);
      if (SESI[i]) console.log(`        → becomes "${SESI[i].title}"`);
    });
    for (const q of chapterTests) console.log(`  chapter test ${q.status} ${q.title} (${q._count.submissions} submissions) → unchanged`);
    for (let i = lessons.length; i < SESI.length; i++) console.log(`  [new] DRAFT ${SESI[i].title}`);

    if (lessons.length > SESI.length) throw new Error(`chapter has ${lessons.length} lessons but the remake defines ${SESI.length}; refusing to guess`);
    const already = lessons.some((l) =>
      l.blocks.some((b) => b.type === "FILE_ATTACHMENT" && /^Bab1-/.test((b.data as { fileName?: string }).fileName ?? ""))
    );
    if (already) throw new Error("this chapter already contains remake PDFs — apply has run before; not running twice");

    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupFile = path.join(BACKUP_DIR, `bab1-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    const quizzesFull = await db.quiz.findMany({
      where: { chapterId: chapter.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    fs.writeFileSync(backupFile, JSON.stringify({ course, chapter, lessons, quizzes: quizzesFull }, null, 2));
    console.log(`\nbackup → ${backupFile}`);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await db.chapter.update({ where: { id: chapter.id }, data: { title: CHAPTER_TITLE } });

    for (let i = 0; i < SESI.length; i++) {
      const spec = SESI[i];
      const existing = lessons[i];
      const lesson =
        existing ??
        (await db.lesson.create({ data: { chapterId: chapter.id, title: spec.title, order: i, status: "DRAFT" } }));

      // Upload first: if the DB transaction fails afterwards we remove the objects again.
      const uploads = new Map<BlockSpec, { storagePath: string; sizeBytes: number }>();
      for (const b of spec.blocks) {
        if (b.type !== "PDF") continue;
        const bytes = fs.readFileSync(pdfPath(b.dir));
        const storagePath = `${lesson.id}/${randomUUID()}-${b.fileName}`;
        const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf" });
        if (error) throw new Error(`upload ${b.fileName}: ${error.message}`);
        uploads.set(b, { storagePath, sizeBytes: bytes.length });
      }

      const replaced = existing?.quizzes ?? [];
      const newStatus = replaced.some((q) => q.status === "PUBLISHED") ? "PUBLISHED" : "DRAFT";

      try {
        await db.$transaction(async (tx) => {
          await tx.lesson.update({ where: { id: lesson.id }, data: { title: spec.title } });
          await tx.contentBlock.deleteMany({ where: { lessonId: lesson.id } });
          await tx.contentBlock.createMany({
            data: spec.blocks.map((b, order) => ({ lessonId: lesson.id, order, ...blockData(b, uploads.get(b)) })),
          });
          for (const q of replaced) {
            await tx.quiz.update({
              where: { id: q.id },
              data: { status: "DRAFT", lessonId: null, title: q.title.startsWith("[Arsip] ") ? q.title : `[Arsip] ${q.title}` },
            });
          }
          await tx.quiz.create({
            data: {
              chapterId: chapter.id,
              lessonId: lesson.id,
              title: spec.quiz.title,
              status: newStatus,
              questions: {
                create: spec.quiz.questions.map((q, order) => ({
                  order,
                  type: q.type,
                  prompt: q.prompt,
                  points: q.points,
                  explanation: q.explanation,
                  ...questionRow(q),
                })),
              },
            },
          });
        }, { timeout: 30_000 });
      } catch (e) {
        await supabase.storage.from(BUCKET).remove([...uploads.values()].map((u) => u.storagePath));
        throw e;
      }

      // Old file blocks (if any) keep their storage objects; the backup JSON records the paths.
      const oldFiles = (existing?.blocks ?? []).filter((b) => b.type === "FILE_ATTACHMENT").length;
      if (oldFiles) console.log(`  note: ${oldFiles} old file block(s) removed from the lesson; storage objects kept`);

      console.log(`✓ ${spec.title}: ${spec.blocks.length} blocks, quiz ${newStatus}, archived ${replaced.length} old quiz(zes)`);
    }
    console.log("\ndone.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
