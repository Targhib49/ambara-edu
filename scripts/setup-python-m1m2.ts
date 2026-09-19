/**
 * Rebuilds Basic Python · Modul 1 and 2 lessons in the book style (see
 * scripts/content/python-m1m2.ts): intro → PDF → captioned visualizations →
 * the lesson's existing exercise editors → Cek Diri.
 *
 *   npx tsx scripts/setup-python-m1m2.ts validate   offline: content parses, every PDF exists
 *   npx tsx scripts/setup-python-m1m2.ts plan       read-only: prints each lesson's current and new block layout
 *   npx tsx scripts/setup-python-m1m2.ts apply      backs up both chapters to JSON, then rewrites them
 *
 * Shared with production and students are enrolled, so apply is conservative:
 *   - lessons are matched by exact title; titles, status and progress are untouched
 *   - CODE_EDITOR and VISUALIZATION rows are KEPT (same ids — the playground links
 *     to visualizations by block id), only their order changes
 *   - MARKDOWN and CODE_SNIPPET rows are deleted after being written to the backup
 *   - quizzes are not touched
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { CHAPTERS, LESSONS, type PythonLessonSpec } from "./content/python-m1m2";

const BOOK_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Python/Buku");
const BACKUP_DIR = path.join(BOOK_DIR, "backups");
const BUCKET = "attachments";
const COURSE_TITLE = "Basic Python";

const mode = process.argv[2] ?? "plan";
const pdfPath = (dir: string) => path.join(BOOK_DIR, dir, `${dir}.pdf`);

const cekDiriMarkdown = (s: PythonLessonSpec) =>
  [
    "## Cek Diri",
    "Sebelum lanjut, jujurlah pada dirimu sendiri. Apakah kamu sudah bisa…",
    "",
    ...s.cekDiri.map((c) => `- [ ] ${c}`),
    "",
    "Ada yang belum? Buka lagi bagian PDF yang sesuai dan kerjakan ulang latihannya.",
    "",
    "---",
    "",
    s.next,
  ].join("\n");

const md = (markdown: string) => ({ type: "MARKDOWN" as const, data: blockDataSchemas.MARKDOWN.parse({ markdown }) });

function validate() {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const s of LESSONS) {
    if (seen.has(s.title)) problems.push(`duplicate title ${s.title}`);
    seen.add(s.title);
    if (!fs.existsSync(pdfPath(s.dir))) problems.push(`${s.title}: missing ${pdfPath(s.dir)}`);
    try {
      md(s.intro);
      md(s.exercises);
      md(cekDiriMarkdown(s));
      for (const c of Object.values(s.vizCaptions ?? {})) md(c);
    } catch (e) {
      problems.push(`${s.title}: ${(e as Error).message}`);
    }
    const size = fs.existsSync(pdfPath(s.dir)) ? `${(fs.statSync(pdfPath(s.dir)).size / 1024).toFixed(0)} KB` : "?";
    console.log(`  ${s.title.padEnd(48)} PDF ${size.padStart(7)}  captions: ${Object.keys(s.vizCaptions ?? {}).join(", ") || "-"}`);
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
  console.log(`\n✓ ${LESSONS.length} lessons valid`);
}

async function main() {
  validate();
  if (mode === "validate") return;
  if (mode !== "plan" && mode !== "apply") throw new Error(`unknown mode "${mode}" — use validate | plan | apply`);

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const course = await db.course.findFirstOrThrow({ where: { title: COURSE_TITLE } });
    const chapters = await db.chapter.findMany({
      where: { courseId: course.id, title: { in: CHAPTERS } },
      include: {
        lessons: { orderBy: { order: "asc" }, include: { blocks: { orderBy: { order: "asc" } } } },
      },
      orderBy: { order: "asc" },
    });
    if (chapters.length !== CHAPTERS.length) throw new Error(`expected chapters ${CHAPTERS.join(" / ")}, found ${chapters.map((c) => c.title).join(" / ")}`);

    const lessons = chapters.flatMap((c) => c.lessons);
    const byTitle = new Map(lessons.map((l) => [l.title, l]));
    for (const s of LESSONS) if (!byTitle.has(s.title)) throw new Error(`lesson not found: "${s.title}"`);
    const unmatched = lessons.filter((l) => !LESSONS.some((s) => s.title === l.title));
    if (unmatched.length) throw new Error(`lessons in these chapters without a spec: ${unmatched.map((l) => l.title).join(", ")}`);

    for (const l of lessons) {
      if (l.blocks.some((b) => b.type === "FILE_ATTACHMENT" && /^Python-M\d/.test((b.data as { fileName?: string }).fileName ?? "")))
        throw new Error(`"${l.title}" already has a remake PDF — apply has run before; not running twice`);
    }

    console.log(`\nCourse ${course.title}`);
    for (const s of LESSONS) {
      const l = byTitle.get(s.title)!;
      const kept = l.blocks.filter((b) => b.type === "CODE_EDITOR" || b.type === "VISUALIZATION");
      const dropped = l.blocks.filter((b) => b.type === "MARKDOWN" || b.type === "CODE_SNIPPET");
      const other = l.blocks.filter((b) => !kept.includes(b) && !dropped.includes(b));
      if (other.length) throw new Error(`"${l.title}" has blocks of an unexpected type: ${other.map((b) => b.type).join(", ")}`);
      const vizNames = kept.filter((b) => b.type === "VISUALIZATION").map((b) => (b.data as { component: string }).component);
      for (const v of vizNames) if (!s.vizCaptions?.[v]) throw new Error(`"${l.title}": no caption for visualization ${v}`);
      console.log(
        `  ${l.status.padEnd(9)} ${l.title}\n      now: ${l.blocks.map((b) => b.type).join(",")}\n      new: MARKDOWN,PDF,${vizNames.map((v) => `MARKDOWN,VIZ(${v})`).join(",")}${vizNames.length ? "," : ""}MARKDOWN,${"CODE_EDITOR,".repeat(kept.length - vizNames.length)}MARKDOWN   (drop ${dropped.length})`
      );
    }

    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupFile = path.join(BACKUP_DIR, `python-m1m2-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({ course, chapters }, null, 2));
    console.log(`\nbackup → ${backupFile}`);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const s of LESSONS) {
      const l = byTitle.get(s.title)!;
      const bytes = fs.readFileSync(pdfPath(s.dir));
      const storagePath = `${l.id}/${randomUUID()}-${s.fileName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf" });
      if (error) throw new Error(`upload ${s.fileName}: ${error.message}`);

      const viz = l.blocks.filter((b) => b.type === "VISUALIZATION");
      const editors = l.blocks.filter((b) => b.type === "CODE_EDITOR");
      const dropIds = l.blocks.filter((b) => b.type === "MARKDOWN" || b.type === "CODE_SNIPPET").map((b) => b.id);

      // Final sequence: new rows are {create}, kept rows are {keep: id}.
      type Slot = { create: ReturnType<typeof md> | { type: "FILE_ATTACHMENT"; data: unknown } } | { keep: string };
      const seq: Slot[] = [
        { create: md(s.intro) },
        {
          create: {
            type: "FILE_ATTACHMENT",
            data: blockDataSchemas.FILE_ATTACHMENT.parse({
              storagePath,
              fileName: s.fileName,
              mimeType: "application/pdf",
              sizeBytes: bytes.length,
              display: "inline",
            }),
          },
        },
        ...viz.flatMap((b) => [{ create: md(s.vizCaptions![(b.data as { component: string }).component]) }, { keep: b.id }]),
        { create: md(s.exercises) },
        ...editors.map((b) => ({ keep: b.id })),
        { create: md(cekDiriMarkdown(s)) },
      ];

      try {
        await db.$transaction(
          async (tx) => {
            await tx.contentBlock.deleteMany({ where: { id: { in: dropIds } } });
            // Park kept rows at high orders first so no two rows ever share an order mid-update.
            for (const [i, b] of [...viz, ...editors].entries())
              await tx.contentBlock.update({ where: { id: b.id }, data: { order: 1000 + i } });
            for (const [order, slot] of seq.entries()) {
              if ("keep" in slot) await tx.contentBlock.update({ where: { id: slot.keep }, data: { order } });
              else await tx.contentBlock.create({ data: { lessonId: l.id, order, type: slot.create.type, data: slot.create.data as object } });
            }
          },
          { timeout: 30_000 }
        );
      } catch (e) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
        throw e;
      }
      console.log(`✓ ${s.title}: ${seq.length} blocks (kept ${viz.length} viz + ${editors.length} editors, dropped ${dropIds.length})`);
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
