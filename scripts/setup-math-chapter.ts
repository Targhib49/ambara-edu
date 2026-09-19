/**
 * Adds an Intermediate Math bab's closing sequence (scripts/content/math-bab<N>-chapter.ts):
 * practices (mastery, terpadu, drill) → 2 try-outs (standar + pengayaan) → 1 exam, all chapter-level.
 * The generalised form of scripts/setup-math-bab1-chapter.ts, for Bab 2 onward.
 *
 *   npx tsx scripts/setup-math-chapter.ts 2 validate   offline: every answer parses, points add up
 *   npx tsx scripts/setup-math-chapter.ts 2 plan       read-only: what exists, what would be created
 *   npx tsx scripts/setup-math-chapter.ts 2 apply      creates the quizzes as DRAFT
 *   npx tsx scripts/setup-math-chapter.ts 2 publish    publishes them and archives the ones they replace, in one transaction
 *   npx tsx scripts/setup-math-chapter.ts 2 sync       after editing content that apply already created: rewrites the
 *                                                      questions of changed quizzes nobody has submitted or practised,
 *                                                      creates new ones as DRAFT, and re-stamps the order
 *
 * Chapter-level quizzes are listed by createdAt, so apply stamps them one
 * second apart in the content's order. Publish archives the replaced quizzes
 * the house way — DRAFT, "[Arsip] " title — so their submissions are kept,
 * after writing them to a JSON backup.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DRILL_SKILLS } from "../src/lib/drills/registry";
import { questionRow, type ChapterContent } from "./content/math-types";
import { BAB2_CHAPTER } from "./content/math-bab2-chapter";

const CONTENT: Record<string, ChapterContent> = { "2": BAB2_CHAPTER };

const BACKUP_DIR = path.resolve(__dirname, "../../Elementary Maths and Python/Mid Math/Buku/backups");

const bab = process.argv[2] ?? "";
const mode = process.argv[3] ?? "plan";
const content = CONTENT[bab];
if (!content) {
  console.error(`usage: npx tsx scripts/setup-math-chapter.ts <${Object.keys(CONTENT).join("|")}> <validate|plan|apply|publish|sync>`);
  process.exit(1);
}

function validate() {
  const problems: string[] = [];
  for (const quiz of content.quizzes) {
    if (quiz.style === "DRILL") {
      if (quiz.questions.length) problems.push(`${quiz.title}: a drill has no authored questions`);
      if (!quiz.settings?.drillSkill || !(quiz.settings.drillSkill in DRILL_SKILLS)) problems.push(`${quiz.title}: unknown drill skill`);
    } else if (!quiz.questions.length) problems.push(`${quiz.title}: no questions`);
    if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && !quiz.settings?.timeLimitMinutes) problems.push(`${quiz.title}: needs a time limit`);
    if (quiz.style === "EXAM" && quiz.settings?.maxAttempts !== 1) problems.push(`${quiz.title}: an exam is one attempt`);
    quiz.questions.forEach((q, i) => {
      const at = `${quiz.title} #${i + 1}`;
      try {
        questionRow(q);
      } catch (e) {
        problems.push(`${at}: ${(e as Error).message}`);
      }
      if (!(q.points > 0)) problems.push(`${at}: points must be > 0`);
      if (/[$\\]/.test(q.prompt)) problems.push(`${at}: prompt looks like LaTeX (plain text only)`);
      if (q.type === "MULTIPLE_CHOICE" || q.type === "MULTI_SELECT") {
        if (q.options.length < 2 || q.options.length > 4) problems.push(`${at}: needs 2–4 options`);
        const letters = q.type === "MULTIPLE_CHOICE" ? [q.answer] : q.answer;
        for (const l of letters) if ("ABCD".indexOf(l) >= q.options.length) problems.push(`${at}: answer ${l} out of range`);
        if (quiz.settings?.randomizeQuestionOrder && q.options.some((o) => /\b(pilihan|opsi) [A-D]\b|\b[A-D] dan [A-D]\b/.test(o)))
          problems.push(`${at}: an option refers to another by letter, which breaks when options are shuffled`);
      }
    });
    const total = quiz.questions.reduce((n, q) => n + q.points, 0);
    if ((quiz.style === "TRYOUT" || quiz.style === "EXAM") && total !== 100) problems.push(`${quiz.title}: worth ${total} points, not 100`);
    const types = [...new Set(quiz.questions.map((q) => q.type))].join(", ");
    console.log(`  ${quiz.style.padEnd(8)} ${quiz.title.padEnd(48)} ${String(quiz.questions.length).padStart(2)} soal · ${String(total).padStart(3)} poin  ${types}`);
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
  if (!["plan", "apply", "publish", "sync"].includes(mode)) throw new Error(`unknown mode "${mode}" — use validate | plan | apply | publish | sync`);

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    const course = await db.course.findFirstOrThrow({ where: { title: { contains: "Intermediate Math", mode: "insensitive" } } });
    const chapter = await db.chapter.findFirstOrThrow({ where: { courseId: course.id, title: content.chapterTitle } });
    const existing = await db.quiz.findMany({
      where: { chapterId: chapter.id, lessonId: null },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { submissions: true, questions: true } } },
    });
    console.log(`\n${course.title} · ${chapter.title} — chapter-level quizzes now:`);
    for (const q of existing) console.log(`  ${q.status.padEnd(9)} ${q.style.padEnd(8)} ${q.title} (${q._count.questions} soal, ${q._count.submissions} submissions)`);

    const titles = content.quizzes.map((q) => q.title);
    const mine = existing.filter((q) => titles.includes(q.title));
    const replaced = existing.filter((q) => content.archiveOnPublish.includes(q.title));

    if (mode === "plan") {
      if (mine.length) console.log(`\nalready created: ${mine.map((q) => `${q.title} (${q.status})`).join(", ")}`);
      else console.log(`\napply would create, in this order, as DRAFT:\n  ${titles.join("\n  ")}`);
      console.log(`publish would publish them${replaced.length ? ` and archive ${replaced.map((q) => `"${q.title}" (${q._count.submissions} submissions kept)`).join(", ")}` : ""}.`);
      return;
    }

    if (mode === "apply") {
      if (mine.length) throw new Error(`already created (${mine.map((q) => q.title).join(", ")}) — not running twice`);
      const base = Date.now();
      for (const [i, quiz] of content.quizzes.entries()) {
        await db.quiz.create({
          data: {
            chapterId: chapter.id,
            lessonId: null,
            title: quiz.title,
            style: quiz.style,
            status: "DRAFT",
            createdAt: new Date(base + i * 1000),
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
        console.log(`✓ created DRAFT ${quiz.style} ${quiz.title}`);
      }
      console.log("\nReview them under Tutor → Quizzes, then run `publish`.");
      return;
    }

    if (mode === "sync") {
      if (!mine.length) throw new Error("nothing created yet — run apply first");
      const full = await db.quiz.findMany({
        where: { id: { in: mine.map((q) => q.id) } },
        include: { questions: { orderBy: { order: "asc" } }, _count: { select: { submissions: true, practiceProgress: true } } },
      });
      const shape = (qs: { type: string; prompt: string; points: number; explanation: string | null; options: unknown; correctAnswer: unknown }[]) =>
        JSON.stringify(qs.map((q) => [q.type, q.prompt, q.points, q.explanation ?? "", q.options, q.correctAnswer]));
      const plan: { title: string; action: "keep" | "rewrite" | "create"; id?: string }[] = [];
      for (const quiz of content.quizzes) {
        const live = full.find((q) => q.title === quiz.title);
        if (!live) {
          plan.push({ title: quiz.title, action: "create" });
          continue;
        }
        const wanted = quiz.questions.map((q) => ({ prompt: q.prompt, points: q.points, explanation: q.explanation, ...questionRow(q) }));
        if (shape(live.questions) === shape(wanted) && live.style === quiz.style) {
          plan.push({ title: quiz.title, action: "keep", id: live.id });
          continue;
        }
        if (live._count.submissions || live._count.practiceProgress)
          throw new Error(`"${quiz.title}" changed but already has ${live._count.submissions} submissions / ${live._count.practiceProgress} practice rows — not rewriting it`);
        plan.push({ title: quiz.title, action: "rewrite", id: live.id });
      }
      for (const p of plan) console.log(`  ${p.action.padEnd(7)} ${p.title}`);
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const file = path.join(BACKUP_DIR, `bab${bab}-before-sync-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      fs.writeFileSync(file, JSON.stringify(full, null, 2));
      console.log(`backup → ${file}`);

      // Keep the chapter's order: stamp everything from the first quiz's createdAt, one second apart.
      const base = Math.min(...full.map((q) => q.createdAt.getTime()));
      await db.$transaction(async (tx) => {
        for (const [i, quiz] of content.quizzes.entries()) {
          const p = plan[i];
          const createdAt = new Date(base + i * 1000);
          const questions = quiz.questions.map((q, order) => ({ order, prompt: q.prompt, points: q.points, explanation: q.explanation, ...questionRow(q) }));
          if (p.action === "create") {
            await tx.quiz.create({
              data: { chapterId: chapter.id, lessonId: null, title: quiz.title, style: quiz.style, status: "DRAFT", createdAt, ...quiz.settings, questions: { create: questions } },
            });
            continue;
          }
          if (p.action === "rewrite") {
            await tx.question.deleteMany({ where: { quizId: p.id } });
            await tx.quiz.update({ where: { id: p.id }, data: { style: quiz.style, ...quiz.settings, questions: { create: questions } } });
          }
          await tx.quiz.update({ where: { id: p.id }, data: { createdAt } });
        }
      }, { timeout: 60_000 });
      console.log("\n✓ synced. New quizzes are DRAFT — run `publish` to publish them.");
      return;
    }

    // publish
    if (mine.length !== content.quizzes.length) throw new Error(`expected ${content.quizzes.length} quizzes from apply, found ${mine.length}`);
    if (replaced.length) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const full = await db.quiz.findMany({ where: { id: { in: replaced.map((q) => q.id) } }, include: { questions: { orderBy: { order: "asc" } } } });
      const file = path.join(BACKUP_DIR, `bab${bab}-replaced-quizzes-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      fs.writeFileSync(file, JSON.stringify(full, null, 2));
      console.log(`backup → ${file}`);
    }
    await db.$transaction([
      db.quiz.updateMany({ where: { id: { in: mine.map((q) => q.id) } }, data: { status: "PUBLISHED" } }),
      ...replaced.map((q) => db.quiz.update({ where: { id: q.id }, data: { status: "DRAFT", title: `[Arsip] ${q.title}` } })),
    ]);
    console.log(`✓ published ${mine.length} quizzes${replaced.length ? `, archived ${replaced.map((q) => `"${q.title}"`).join(", ")}` : ""}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
