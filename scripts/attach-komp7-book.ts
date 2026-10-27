/**
 * Adds the materials book to the Kelas 7 competition course: one lesson per
 * syllabus chapter, holding a short intro and that chapter's PDF (shown inline
 * in the flip-book reader). The PDFs come from the book folder:
 *
 *   cd "../Elementary Maths and Python/Mid Math/Buku/komp7-buku"
 *   xelatex komp7-buku.tex (×2), then python3 split-komp7-buku.py  → bab/komp7-bab-NN.pdf
 *
 *   npx tsx scripts/attach-komp7-book.ts plan    read-only: what apply would add
 *   npx tsx scripts/attach-komp7-book.ts apply   uploads the PDFs and creates the lessons
 *
 * The database is shared with production. apply only adds: a chapter that
 * already has its book lesson is skipped, quizzes are not touched, and nothing
 * is deleted. If a lesson fails to save, its uploaded PDF is removed again.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { KOMP7_LATIHAN } from "./content/komp7-latihan";

const COURSE_TITLE = "Persiapan Kompetisi Matematika SMP — Kelas 7";
const BOOK_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku/komp7-buku/bab");
const BUCKET = "attachments";
const FILE_PREFIX = "komp7-bab-";

// Chapter titles as printed in the book (the course's chapter titles are slightly shorter).
const BOOK_TITLES = [
  "Operasi Hitung Bilangan",
  "Alphametics dan Cryptarithm",
  "Pertidaksamaan pada Bilangan Rasional",
  "Pasangan Bilangan Bulat",
  "Pemecahan Masalah",
  "Aritmatika Sosial",
  "Keterbagian Bilangan Bulat",
  "Rasio dan Perbandingan",
  "Luas Bangun Datar yang Beririsan",
  "Jarak, Kecepatan, dan Waktu",
  "Luas Arsiran Segiempat",
  "Operasi Hitung Bentuk Aljabar",
];

const mode = process.argv[2] ?? "plan";
if (mode !== "plan" && mode !== "apply") {
  console.error("usage: npx tsx scripts/attach-komp7-book.ts <plan|apply>");
  process.exit(1);
}

type Spec = { bab: number; chapterTitle: string; lessonTitle: string; fileName: string; filePath: string; intro: string };

const specs: Spec[] = KOMP7_LATIHAN.map((chapter, i) => {
  const bab = i + 1;
  const fileName = `${FILE_PREFIX}${String(bab).padStart(2, "0")}.pdf`;
  const practice = chapter.quizzes[0].title;
  return {
    bab,
    chapterTitle: chapter.chapterTitle,
    lessonTitle: `Materi Bab ${bab}: ${BOOK_TITLES[i]}`,
    fileName,
    filePath: path.join(BOOK_DIR, fileName),
    intro: [
      `Ini Bab ${bab} dari buku *Matematika Kompetisi SMP Kelas 7*. Baca pelan-pelan dengan kertas dan pensil, dan kerjakan setiap **Cek Cepat** sebelum melihat jawabannya di akhir bab.`,
      "",
      "Tekan tombol layar penuh pada pembaca PDF agar halamannya tampil seperti buku.",
      "",
      `Setelah selesai membaca, kerjakan **${practice}** di bab ini. Jawabanmu langsung diperiksa.`,
    ].join("\n"),
  };
});

function validate() {
  const problems: string[] = [];
  if (specs.length !== BOOK_TITLES.length) problems.push(`${specs.length} course chapters but ${BOOK_TITLES.length} book titles`);
  for (const s of specs) {
    if (!fs.existsSync(s.filePath)) problems.push(`missing ${s.filePath} — run split-komp7-buku.py`);
    try {
      blockDataSchemas.MARKDOWN.parse({ markdown: s.intro });
    } catch (e) {
      problems.push(`Bab ${s.bab}: intro invalid: ${(e as Error).message}`);
    }
  }
  if (problems.length) {
    console.error(`✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
}

async function main() {
  validate();
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const course = await db.course.findFirstOrThrow({
      where: { title: COURSE_TITLE },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: { lessons: { include: { blocks: { select: { type: true, data: true } } } } },
        },
      },
    });
    console.log(`course: ${course.title} (${course.status})`);

    const todo: { spec: Spec; chapterId: string; order: number }[] = [];
    for (const spec of specs) {
      const chapter = course.chapters.find((c) => c.title === spec.chapterTitle);
      if (!chapter) throw new Error(`chapter "${spec.chapterTitle}" not found — run setup-komp7.ts first`);
      const has = chapter.lessons.some((l) =>
        l.blocks.some((b) => b.type === "FILE_ATTACHMENT" && ((b.data as { fileName?: string }).fileName ?? "").startsWith(FILE_PREFIX))
      );
      const kb = Math.round(fs.statSync(spec.filePath).size / 1024);
      console.log(`  Bab ${String(spec.bab).padStart(2)}  ${spec.chapterTitle.padEnd(38)} ${has ? "already has its book lesson — skip" : `add "${spec.lessonTitle}" (${kb} KB)`}`);
      if (!has) todo.push({ spec, chapterId: chapter.id, order: chapter.lessons.length });
    }

    if (mode === "plan") {
      console.log(`\nplan only — nothing changed. ${todo.length} lesson(s) to add. Run with \`apply\` to execute.`);
      return;
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const { spec, chapterId, order } of todo) {
      const lessonId = randomUUID();
      const bytes = fs.readFileSync(spec.filePath);
      const storagePath = `${lessonId}/${randomUUID()}-${spec.fileName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf" });
      if (error) throw new Error(`upload ${spec.fileName}: ${error.message}`);
      try {
        await db.lesson.create({
          data: {
            id: lessonId,
            chapterId,
            title: spec.lessonTitle,
            order,
            status: "PUBLISHED",
            blocks: {
              create: [
                { order: 0, type: "MARKDOWN", data: blockDataSchemas.MARKDOWN.parse({ markdown: spec.intro }) },
                {
                  order: 1,
                  type: "FILE_ATTACHMENT",
                  data: blockDataSchemas.FILE_ATTACHMENT.parse({
                    storagePath,
                    fileName: spec.fileName,
                    mimeType: "application/pdf",
                    sizeBytes: bytes.length,
                    display: "inline",
                  }),
                },
              ],
            },
          },
        });
      } catch (e) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
        throw e;
      }
      console.log(`✓ Bab ${spec.bab}: ${spec.lessonTitle}`);
    }
    console.log(`\n✓ ${todo.length} lesson(s) added. The course is still a DRAFT.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
