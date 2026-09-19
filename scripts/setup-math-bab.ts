/**
 * Replaces one Intermediate Math bab with its book-style remake (PDF lessons +
 * new Latihan Mandiri quizzes) from scripts/content/math-bab<N>.ts. The
 * generalised form of scripts/setup-math-bab1.ts, for Bab 2 onward.
 *
 *   npx tsx scripts/setup-math-bab.ts 2 validate   offline: content parses against the app's Zod schemas, PDFs exist
 *   npx tsx scripts/setup-math-bab.ts 2 plan       read-only: prints the live chapter and what apply would change
 *   npx tsx scripts/setup-math-bab.ts 2 apply      backs up the chapter to JSON, then rewrites it
 *
 * The DB is shared with production and students are enrolled, so apply never
 * deletes anything a student produced:
 *   - existing lesson rows are REUSED in order, keeping LessonProgress; only title + blocks change
 *   - old lesson-linked quizzes are archived (DRAFT, "[Arsip] " title, detached from the lesson),
 *     never deleted, so submissions and score history survive
 *   - chapter-level quizzes are left untouched (scripts/setup-math-chapter.ts handles those)
 *   - each new quiz takes the publish status of the quiz it replaces (DRAFT if there was none)
 * Old blocks are deleted after being written to the backup file.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { questionRow, type BabContent, type Block } from "./content/math-types";
import { BAB2 } from "./content/math-bab2";

const CONTENT: Record<string, BabContent> = { "2": BAB2 };

const BOOK_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku");
const BACKUP_DIR = path.join(BOOK_DIR, "backups");
const BUCKET = "attachments";
const COURSE_TITLE_MATCH = "Intermediate Math";

const bab = process.argv[2] ?? "";
const mode = process.argv[3] ?? "plan";
const content = CONTENT[bab];
if (!content) {
  console.error(`usage: npx tsx scripts/setup-math-bab.ts <${Object.keys(CONTENT).join("|")}> <validate|plan|apply>`);
  process.exit(1);
}

function pdfPath(dir: string) {
  return path.join(BOOK_DIR, dir, `${dir}.pdf`);
}

function blockData(b: Block, uploaded?: { storagePath: string; sizeBytes: number }) {
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
  for (const s of content.sesi) {
    for (const b of s.blocks) {
      if (b.type === "PDF" && !fs.existsSync(pdfPath(b.dir))) problems.push(`${s.title}: missing ${pdfPath(b.dir)}`);
      if (b.type === "PDF" && !b.fileName.startsWith(content.pdfPrefix)) problems.push(`${s.title}: PDF name lacks prefix ${content.pdfPrefix}`);
      try {
        blockData(b);
      } catch (e) {
        problems.push(`${s.title}: block ${b.type} invalid: ${(e as Error).message}`);
      }
    }
    s.quiz.questions.forEach((q, i) => {
      const at = `${s.quiz.title} #${i + 1}`;
      try {
        questionRow(q);
      } catch (e) {
        problems.push(`${at}: ${(e as Error).message}`);
      }
      if (/[$\\]/.test(q.prompt)) problems.push(`${at}: prompt looks like LaTeX (plain text only)`);
      if (q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") {
        if (q.options.length < 2 || q.options.length > 4) problems.push(`${at}: needs 2–4 options`);
        const letters = q.type === "MULTIPLE_CHOICE" ? [q.answer] : q.answer;
        for (const l of letters) if ("ABCD".indexOf(l) >= q.options.length) problems.push(`${at}: answer ${l} out of range`);
      }
      const tier = q.prompt.match(/^\[(Dasar|Menengah|Tantangan)\]/)?.[1];
      if (!tier) problems.push(`${at}: prompt lacks [Dasar]/[Menengah]/[Tantangan] tag`);
      const expected = { Dasar: [1], Menengah: [2], Tantangan: [3, 4] }[tier ?? "Dasar"]!;
      if (!expected.includes(q.points)) problems.push(`${at}: ${tier} worth ${q.points} pts`);
      if (q.type === "CODE")
        for (const t of q.tests)
          if (t.expectedOutput !== t.expectedOutput.replace(/[ \t]+$/gm, "").replace(/\n+$/, ""))
            problems.push(`${at}: expectedOutput not stable under output normalisation`);
    });
    const pts = s.quiz.questions.reduce((n, q) => n + q.points, 0);
    const pdf = s.blocks.find((b): b is Extract<Block, { type: "PDF" }> => b.type === "PDF");
    const size = pdf && fs.existsSync(pdfPath(pdf.dir)) ? `${(fs.statSync(pdfPath(pdf.dir)).size / 1024).toFixed(0)} KB` : "?";
    console.log(`  ${s.title.padEnd(66)} ${String(s.blocks.length).padStart(2)} blocks · PDF ${size.padStart(7)} · ${s.quiz.questions.length} soal / ${pts} poin`);
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
  console.log("\n✓ content valid");
}

async function main() {
  validate();
  if (mode === "validate") return;
  if (mode !== "plan" && mode !== "apply") throw new Error(`unknown mode "${mode}" — use validate | plan | apply`);

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const courses = await db.course.findMany({
      where: { title: { contains: COURSE_TITLE_MATCH, mode: "insensitive" } },
      include: { chapters: { orderBy: { order: "asc" } } },
    });
    if (courses.length !== 1) throw new Error(`expected exactly one course matching "${COURSE_TITLE_MATCH}", found ${courses.length}`);
    const course = courses[0];
    const chapter = course.chapters.find((c) => new RegExp(`^bab\\s*${bab}\\b`, "i").test(c.title));
    if (!chapter) throw new Error(`course has no "Bab ${bab}" chapter`);

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
    console.log(`Chapter ${chapter.title}  →  ${content.chapterTitle}`);
    lessons.forEach((l, i) => {
      console.log(`  [${i}] ${l.status.padEnd(9)} ${l.title}  (${l.blocks.length} blocks, ${l._count.progress} progress rows)`);
      for (const q of l.quizzes)
        console.log(`        quiz ${q.status.padEnd(9)} ${q.title}  (${q._count.questions} soal, ${q._count.submissions} submissions) → archive`);
      if (content.sesi[i]) console.log(`        → becomes "${content.sesi[i].title}"`);
    });
    for (const q of chapterTests) console.log(`  chapter test ${q.status} ${q.title} (${q._count.submissions} submissions) → unchanged`);
    for (let i = lessons.length; i < content.sesi.length; i++) console.log(`  [new] DRAFT ${content.sesi[i].title}`);

    if (lessons.length > content.sesi.length)
      throw new Error(`chapter has ${lessons.length} lessons but the remake defines ${content.sesi.length}; refusing to guess`);
    const already = lessons.some((l) =>
      l.blocks.some((b) => b.type === "FILE_ATTACHMENT" && ((b.data as { fileName?: string }).fileName ?? "").startsWith(content.pdfPrefix))
    );
    if (already) throw new Error("this chapter already contains remake PDFs — apply has run before; not running twice");

    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupFile = path.join(BACKUP_DIR, `bab${bab}-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    const quizzesFull = await db.quiz.findMany({
      where: { chapterId: chapter.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    fs.writeFileSync(backupFile, JSON.stringify({ course, chapter, lessons, quizzes: quizzesFull }, null, 2));
    console.log(`\nbackup → ${backupFile}`);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await db.chapter.update({ where: { id: chapter.id }, data: { title: content.chapterTitle } });

    for (let i = 0; i < content.sesi.length; i++) {
      const spec = content.sesi[i];
      const existing = lessons[i];
      const lesson =
        existing ??
        (await db.lesson.create({ data: { chapterId: chapter.id, title: spec.title, order: i, status: "DRAFT" } }));

      // Upload first: if the DB transaction fails afterwards we remove the objects again.
      const uploads = new Map<Block, { storagePath: string; sizeBytes: number }>();
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
