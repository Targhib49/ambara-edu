/**
 * Builds the olympiad course from scripts/content/olim-*.ts:
 * "Persiapan Olimpiade Matematika (MS²C)" with one chapter per topic, a
 * lesson per session (the book PDF), and each session's problem set.
 *
 *   npx tsx scripts/setup-olim.ts validate   offline: content parses against the app's Zod schemas, PDFs exist
 *   npx tsx scripts/setup-olim.ts plan       read-only: what apply would create or change
 *   npx tsx scripts/setup-olim.ts apply      creates/updates the course, uploading the PDFs
 *
 * The database is shared with production, so apply is written to be safe to
 * re-run while the course is being built chapter by chapter:
 *   - the course and its chapters are created once, then reused by title
 *   - a session's lesson is reused if it exists, keeping LessonProgress
 *   - a session's problem set is only created when it isn't there; an
 *     existing one is left alone, because it may already hold submissions
 *   - nothing is ever deleted
 *
 * The course is created as a DRAFT with nobody enrolled — Targhib publishes
 * and enrols when he's ready, the convention the Python track set.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { questionRow, type BabContent, type Block, type ChapterContent, type Question } from "./content/math-types";
import { OLIM_TEORI_BILANGAN } from "./content/olim-teori-bilangan";
import { OLIM_ALJABAR } from "./content/olim-aljabar";
import { OLIM_KOMBINATORIKA } from "./content/olim-kombinatorika";
import { OLIM_GEOMETRI } from "./content/olim-geometri";
import { OLIM_ALJABAR_CHAPTER, OLIM_GEOMETRI_CHAPTER, OLIM_KOMBINATORIKA_CHAPTER, OLIM_TEORI_BILANGAN_CHAPTER } from "./content/olim-chapters";

const COURSE_TITLE = "Persiapan Olimpiade Matematika (MS²C)";
const COURSE_DESCRIPTION =
  "Persiapan kompetisi MS²C: aljabar, geometri, teori bilangan, dan kombinatorika. Setiap sesi berisi materi ringkas dan satu set soal, termasuk soal uraian yang dinilai dari prosesnya.";

/** Chapter order in the course; a chapter not yet written is simply absent. */
const CHAPTERS: BabContent[] = [OLIM_ALJABAR, OLIM_TEORI_BILANGAN, OLIM_KOMBINATORIKA, OLIM_GEOMETRI];

/** Each chapter's closing sequence: mastery, try-out, final simulation. */
const CHAPTER_QUIZZES: ChapterContent[] = [OLIM_ALJABAR_CHAPTER, OLIM_TEORI_BILANGAN_CHAPTER, OLIM_KOMBINATORIKA_CHAPTER, OLIM_GEOMETRI_CHAPTER];

const BOOK_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku");
const BACKUP_DIR = path.join(BOOK_DIR, "backups");
const BUCKET = "attachments";

const mode = process.argv[2] ?? "plan";

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

/**
 * Offline checks. Unlike the Kelas VII remake, prompts here may carry LaTeX
 * between dollars — MathText renders it — so what's checked is that the
 * dollars are balanced, not that they're absent.
 */
/**
 * WORKED-only checks. The auto-award and the rubric together are what the
 * question is worth, so they have to add up to `points` — otherwise the
 * marking screen suggests a total the question cannot hold.
 */
function checkWorked(q: Question, at: string, problems: string[]) {
  if (q.type !== "WORKED") return;
  const marks = q.answerMarks ?? 1;
  if (marks === 0 && q.answer.trim() !== "") problems.push(`${at}: a stated answer with no marks for it`);
  if (marks > 0 && q.answer.trim() === "") problems.push(`${at}: marks for an answer the question never asks for`);
  if (!q.rubric.length) problems.push(`${at}: WORKED needs a marking scheme`);
  if (!q.solution.trim()) problems.push(`${at}: WORKED needs a model solution`);
  const scheme = marks + q.rubric.reduce((n, r) => n + r.marks, 0);
  if (scheme !== q.points) problems.push(`${at}: marking scheme totals ${scheme}, question is worth ${q.points}`);
}

function validate() {
  const problems: string[] = [];
  for (const chapter of CHAPTERS) {
    console.log(`\n${chapter.chapterTitle}`);
    for (const s of chapter.sesi) {
      for (const b of s.blocks) {
        if (b.type === "PDF" && !fs.existsSync(pdfPath(b.dir))) problems.push(`${s.title}: missing ${pdfPath(b.dir)}`);
        if (b.type === "PDF" && !b.fileName.startsWith(chapter.pdfPrefix)) {
          problems.push(`${s.title}: PDF name lacks prefix ${chapter.pdfPrefix}`);
        }
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
        const texts = [q.prompt, q.explanation, ...(q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT" ? q.options : [])];
        for (const text of texts) {
          // An odd number of unescaped dollars means a formula was left open.
          const dollars = (text.match(/(?<!\\)\$/g) ?? []).length;
          if (dollars % 2 !== 0) problems.push(`${at}: unbalanced $ in "${text.slice(0, 50)}…"`);
        }
        if (q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") {
          if (q.options.length < 2 || q.options.length > 4) problems.push(`${at}: needs 2–4 options`);
          const letters = q.type === "MULTIPLE_CHOICE" ? [q.answer] : q.answer;
          for (const l of letters) if ("ABCD".indexOf(l) >= q.options.length) problems.push(`${at}: answer ${l} out of range`);
        }
        checkWorked(q, at, problems);
      });
      const pts = s.quiz.questions.reduce((n, q) => n + q.points, 0);
      const worked = s.quiz.questions.filter((q) => q.type === "WORKED").length;
      const pdf = s.blocks.find((b): b is Extract<Block, { type: "PDF" }> => b.type === "PDF");
      const size = pdf && fs.existsSync(pdfPath(pdf.dir)) ? `${(fs.statSync(pdfPath(pdf.dir)).size / 1024).toFixed(0)} KB` : "?";
      console.log(`  ${s.title.padEnd(48)} PDF ${size.padStart(7)} · ${String(s.quiz.questions.length).padStart(2)} soal / ${String(pts).padStart(3)} poin · ${worked} uraian`);
    }
  }
  for (const chapter of CHAPTER_QUIZZES) {
    console.log(`\n${chapter.chapterTitle} — kuis bab`);
    for (const quiz of chapter.quizzes) {
      const total = quiz.questions.reduce((n, q) => n + q.points, 0);
      const worked = quiz.questions.filter((q) => q.type === "WORKED").length;
      // The Kelas VII convention: a timed graded paper is out of 100.
      if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && total !== 100) problems.push(`${quiz.title}: worth ${total} points, not 100`);
      if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && !quiz.settings?.timeLimitMinutes) problems.push(`${quiz.title}: needs a time limit`);
      if (quiz.style === "EXAM" && quiz.settings?.maxAttempts !== 1) problems.push(`${quiz.title}: an exam is one attempt`);
      // Practice checks an answer on the spot; a written solution has none.
      if (quiz.style === "MASTERY" && worked > 0) problems.push(`${quiz.title}: practice can't hold WORKED questions`);
      for (const [i, q] of quiz.questions.entries()) {
        const at = `${quiz.title} #${i + 1}`;
        try {
          questionRow(q);
        } catch (e) {
          problems.push(`${at}: ${(e as Error).message}`);
        }
        const texts = [q.prompt, q.explanation, ...(q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT" ? q.options : [])];
        for (const text of texts) {
          const dollars = (text.match(/(?<!\\)\$/g) ?? []).length;
          if (dollars % 2 !== 0) problems.push(`${at}: unbalanced $ in "${text.slice(0, 50)}…"`);
        }
        checkWorked(q, at, problems);
      }
      console.log(`  ${quiz.style.padEnd(8)} ${quiz.title.padEnd(44)} ${String(quiz.questions.length).padStart(2)} soal / ${String(total).padStart(3)} poin · ${worked} uraian`);
    }
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
    const tutor = await db.user.findFirstOrThrow({ where: { role: "TUTOR" }, select: { id: true, name: true } });
    const existing = await db.course.findFirst({
      where: { title: COURSE_TITLE },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" }, include: { quizzes: true, blocks: true } } },
        },
      },
    });

    console.log(`\ncourse: ${COURSE_TITLE} — ${existing ? "exists" : "will be created"} (owner ${tutor.name})`);
    for (const [i, chapter] of CHAPTERS.entries()) {
      const live = existing?.chapters.find((c) => c.title === chapter.chapterTitle);
      console.log(`  ${i + 1}. ${chapter.chapterTitle}: ${live ? `${live.lessons.length} lesson(s) live` : "new"}`);
      for (const s of chapter.sesi) {
        const lesson = live?.lessons.find((l) => l.title === s.title);
        const quiz = lesson?.quizzes.find((q) => q.title === s.quiz.title);
        console.log(`     ${s.title.padEnd(48)} ${lesson ? (quiz ? "lesson + quiz already there" : "lesson there, quiz to add") : "to create"}`);
      }
    }

    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    if (existing) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const file = path.join(BACKUP_DIR, `olim-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      fs.writeFileSync(file, JSON.stringify(existing, null, 2));
      console.log(`\nbackup → ${file}`);
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const course =
      existing ??
      (await db.course.create({
        data: {
          title: COURSE_TITLE,
          description: COURSE_DESCRIPTION,
          subject: "Mathematics",
          level: "Olimpiade SMP",
          curriculum: "MS²C",
          status: "DRAFT",
          ownerId: tutor.id,
        },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" }, include: { quizzes: true, blocks: true } } },
          },
        },
      }));

    const created = { chapters: 0, lessons: 0, quizzes: 0, uploads: 0 };

    for (const [chapterIndex, spec] of CHAPTERS.entries()) {
      const live = course.chapters.find((c) => c.title === spec.chapterTitle);
      const chapter = live ?? {
        ...(await db.chapter.create({ data: { courseId: course.id, title: spec.chapterTitle, order: chapterIndex } })),
        lessons: [] as (typeof course.chapters)[number]["lessons"],
      };
      if (!live) created.chapters++;

      for (const [sesiIndex, s] of spec.sesi.entries()) {
        let lesson = chapter.lessons.find((l) => l.title === s.title);
        if (!lesson) {
          const fresh = await db.lesson.create({
            data: { chapterId: chapter.id, title: s.title, order: sesiIndex, status: "PUBLISHED" },
          });
          lesson = { ...fresh, quizzes: [], blocks: [] };
          created.lessons++;

          // Upload before writing the blocks that point at the files.
          const uploads = new Map<Block, { storagePath: string; sizeBytes: number }>();
          for (const b of s.blocks) {
            if (b.type !== "PDF") continue;
            const bytes = fs.readFileSync(pdfPath(b.dir));
            const storagePath = `${lesson.id}/${randomUUID()}-${b.fileName}`;
            const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf" });
            if (error) throw new Error(`upload ${b.fileName}: ${error.message}`);
            uploads.set(b, { storagePath, sizeBytes: bytes.length });
            created.uploads++;
          }
          await db.contentBlock.createMany({
            data: s.blocks.map((b, order) => ({ lessonId: lesson!.id, order, ...blockData(b, uploads.get(b)) })),
          });
        }

        // A problem set that already exists is left alone: it may hold work.
        if (!lesson.quizzes.some((q) => q.title === s.quiz.title)) {
          await db.quiz.create({
            data: {
              chapterId: chapter.id,
              lessonId: lesson.id,
              title: s.quiz.title,
              status: "PUBLISHED",
              style: "CLASSIC",
              questions: {
                create: s.quiz.questions.map((q, order) => ({
                  order,
                  prompt: q.prompt,
                  points: q.points,
                  explanation: q.explanation,
                  ...questionRow(q),
                })),
              },
            },
          });
          created.quizzes++;
        }
      }

      // The chapter's own quizzes sit beside the sessions, not inside one.
      const closing = CHAPTER_QUIZZES.find((c) => c.chapterTitle === spec.chapterTitle);
      if (closing) {
        const live = await db.quiz.findMany({ where: { chapterId: chapter.id, lessonId: null }, select: { title: true } });
        for (const quiz of closing.quizzes) {
          if (live.some((q) => q.title === quiz.title)) continue;
          await db.quiz.create({
            data: {
              chapterId: chapter.id,
              lessonId: null,
              title: quiz.title,
              status: "PUBLISHED",
              style: quiz.style,
              ...quiz.settings,
              questions: {
                create: quiz.questions.map((q, order) => ({
                  order,
                  prompt: q.prompt,
                  points: q.points,
                  explanation: q.explanation,
                  ...questionRow(q),
                })),
              },
            },
          });
          created.quizzes++;
        }
      }
    }

    console.log(
      `\n✓ ${created.chapters} chapter(s), ${created.lessons} lesson(s), ${created.quizzes} quiz(zes), ${created.uploads} PDF(s) uploaded.`
    );
    console.log(`  Course is a DRAFT: publish it and enrol students when you're ready.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
