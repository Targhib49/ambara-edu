/**
 * THROWAWAY QA fixtures. `create` makes a disposable tutor + student, a course
 * with one lesson exercising every block type, and two lesson-linked quizzes;
 * `destroy` removes all of it (auth users, storage objects, rows).
 *
 * The DB is shared with production, so nothing here may be visible to real
 * students: the fixture course is only enrolled to the fixture student, and no
 * PUBLISHED standalone try-out is ever created (those are visible to everyone).
 */
import "dotenv/config";
import fs from "fs";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BUCKET = "attachments";
const STATE = process.argv[3] ?? "/tmp/qa-fixture-state.json";
const PDF = process.argv[4] ?? "/tmp/qa-fixture.pdf";
// Throwaway credential for accounts this script creates and then deletes.
// It is never a real user's password and grants nothing once teardown runs.
const PASSWORD = "qa-fixture-pw-9182";

/**
 * Minimal one-page PDF, generated so the script has no external asset to go
 * looking for. Exists purely to prove the inline PDF viewer renders something.
 */
export function writeFixturePdf(path: string) {
  const text = Buffer.from(
    "BT /F1 18 Tf 40 140 Td (QA fixture PDF) Tj ET\n" +
      "BT /F1 11 Tf 40 112 Td (Disposable file for checking the inline PDF viewer.) Tj ET"
  );
  const objects = [
    Buffer.from("<</Type/Catalog/Pages 2 0 R>>"),
    Buffer.from("<</Type/Pages/Kids[3 0 R]/Count 1>>"),
    Buffer.from(
      "<</Type/Page/Parent 2 0 R/MediaBox[0 0 400 220]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>"
    ),
    Buffer.concat([Buffer.from(`<</Length ${text.length}>>\nstream\n`), text, Buffer.from("\nendstream")]),
    Buffer.from("<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>"),
  ];

  let body = Buffer.from("%PDF-1.4\n");
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(body.length);
    body = Buffer.concat([body, Buffer.from(`${i + 1} 0 obj\n`), obj, Buffer.from("\nendobj\n")]);
  });

  const xrefOffset = body.length;
  let tail = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) tail += `${String(offset).padStart(10, "0")} 00000 n \n`;
  tail += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  fs.writeFileSync(path, Buffer.concat([body, Buffer.from(tail)]));
}

type State = {
  tutorId: string;
  studentId: string;
  courseId: string;
  tutorEmail: string;
  studentEmail: string;
  storagePaths: string[];
};

async function create() {
  const stamp = randomUUID().slice(0, 8);
  const tutorEmail = `qa-tutor-${stamp}@example.com`;
  const studentEmail = `qa-student-${stamp}@example.com`;

  const mkUser = async (email: string, name: string, role: "TUTOR" | "STUDENT") => {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    await db.user.create({
      data: { id: data.user.id, email, name, role, ...(role === "STUDENT" ? { studentGroup: "UNDERGRAD" as const } : {}) },
    });
    return data.user.id;
  };

  const tutorId = await mkUser(tutorEmail, "QA Tutor", "TUTOR");
  const studentId = await mkUser(studentEmail, "QA Student", "STUDENT");

  const course = await db.course.create({
    data: {
      title: "ZZQA Fixture Course",
      description: "Disposable QA fixture — safe to delete.",
      ownerId: tutorId,
      chapters: {
        create: [
          {
            title: "ZZQA Chapter 1 — Media",
            order: 0,
            lessons: {
              create: [
                { title: "ZZQA Media Lesson", order: 0, status: "PUBLISHED" },
                { title: "ZZQA Reading Lesson", order: 1, status: "PUBLISHED" },
              ],
            },
          },
          {
            title: "ZZQA Chapter 2 — Practice",
            order: 1,
            lessons: {
              create: [
                { title: "ZZQA Python Lesson", order: 0, status: "PUBLISHED" },
                { title: "ZZQA Draft Lesson", order: 1, status: "DRAFT" },
              ],
            },
          },
        ],
      },
    },
    include: { chapters: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
  const lesson = course.chapters[0].lessons[0];
  const readingLesson = course.chapters[0].lessons[1];
  const pythonLesson = course.chapters[1].lessons[0];
  await db.enrollment.create({ data: { studentId, courseId: course.id } });

  if (!fs.existsSync(PDF)) writeFixturePdf(PDF);

  // Upload the fixture PDF twice: one shown inline, one download-only.
  const storagePaths: string[] = [];
  const upload = async (label: string) => {
    const path = `${lesson.id}/${randomUUID()}-${label}.pdf`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, fs.readFileSync(PDF), { contentType: "application/pdf" });
    if (error) throw error;
    storagePaths.push(path);
    return path;
  };
  const inlinePath = await upload("qa-inline-handout");
  const downloadPath = await upload("qa-download-worksheet");

  await db.contentBlock.createMany({
    data: [
      {
        lessonId: readingLesson.id,
        order: 0,
        type: "MARKDOWN",
        data: { markdown: "## Reading only\n\nThis lesson should be labelled a reading." },
      },
      {
        lessonId: pythonLesson.id,
        order: 0,
        type: "CODE_EDITOR",
        data: { starterCode: 'print("hello from the QA fixture")\n' },
      },
      {
        lessonId: lesson.id,
        order: 0,
        type: "MARKDOWN",
        data: { markdown: "## Markdown still works\n\nInline math $E = mc^2$ and a list:\n\n- one\n- two" },
      },
      {
        lessonId: lesson.id,
        order: 1,
        type: "VIDEO_EMBED",
        data: { url: "https://www.youtube.com/watch?v=aircAruvnKk", caption: "But what is a neural network?" },
      },
      {
        lessonId: lesson.id,
        order: 2,
        type: "FILE_ATTACHMENT",
        data: {
          storagePath: inlinePath,
          fileName: "qa-inline-handout.pdf",
          mimeType: "application/pdf",
          sizeBytes: fs.statSync(PDF).size,
          display: "inline",
        },
      },
      {
        lessonId: lesson.id,
        order: 3,
        type: "FILE_ATTACHMENT",
        data: {
          storagePath: downloadPath,
          fileName: "qa-download-worksheet.pdf",
          mimeType: "application/pdf",
          sizeBytes: fs.statSync(PDF).size,
          display: "download",
        },
      },
    ],
  });

  // Two lesson-linked quizzes: one published (with a graded submission so the
  // score ring renders) and one draft, so both table states are exercised.
  const published = await db.quiz.create({
    data: {
      title: "ZZQA Published Quiz",
      lessonId: lesson.id,
      status: "PUBLISHED",
      timeLimitMinutes: 30,
      maxAttempts: 2,
      questions: {
        create: [
          {
            order: 0,
            type: "MULTIPLE_CHOICE",
            prompt: "2 + 2 = ?",
            options: ["3", "4", "5", "6"],
            correctAnswer: { letter: "B" },
            points: 10,
          },
          {
            order: 1,
            type: "NUMERIC",
            prompt: "Square root of 81?",
            options: [],
            correctAnswer: { value: 9, tolerance: 0 },
            points: 10,
          },
        ],
      },
    },
  });
  await db.quiz.create({
    data: {
      title: "ZZQA Draft Quiz",
      lessonId: lesson.id,
      status: "DRAFT",
      questions: {
        create: [
          {
            order: 0,
            type: "SHORT_TEXT",
            prompt: "Capital of Indonesia?",
            options: [],
            correctAnswer: { kind: "exact", value: "Jakarta" },
            points: 5,
          },
        ],
      },
    },
  });
  await db.quiz.create({
    data: {
      title: "ZZQA Chapter 2 Quiz",
      lessonId: pythonLesson.id,
      status: "PUBLISHED",
      questions: {
        create: [
          {
            order: 0,
            type: "NUMERIC",
            prompt: "How many chapters does this fixture have?",
            options: [],
            correctAnswer: { value: 2, tolerance: 0 },
            points: 5,
          },
        ],
      },
    },
  });

  await db.submission.create({
    data: {
      quizId: published.id,
      studentId,
      status: "AUTO_GRADED",
      autoScore: 15,
      answers: {},
    },
  });

  const state: State = { tutorId, studentId, courseId: course.id, tutorEmail, studentEmail, storagePaths };
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
  console.log(JSON.stringify({ ...state, password: PASSWORD, lessonId: lesson.id }, null, 2));
}

async function destroy() {
  const state: State = JSON.parse(fs.readFileSync(STATE, "utf8"));
  await supabase.storage.from(BUCKET).remove(state.storagePaths);
  const ids = [state.tutorId, state.studentId];
  await db.submissionAttempt.deleteMany({ where: { studentId: state.studentId } });
  await db.submission.deleteMany({ where: { studentId: state.studentId } });
  await db.timedQuizSession.deleteMany({ where: { studentId: state.studentId } });
  await db.lessonProgress.deleteMany({ where: { studentId: state.studentId } });
  // Session has no cascade on its user relations, so these must go before the
  // users do or the delete fails with a foreign-key error — which is exactly
  // how fixtures once survived a teardown.
  await db.session.deleteMany({
    where: { OR: [{ studentId: { in: ids } }, { tutorId: { in: ids } }] },
  });
  await db.sessionSeries.deleteMany({
    where: { OR: [{ studentId: { in: ids } }, { tutorId: { in: ids } }] },
  });
  await db.availability.deleteMany({ where: { tutorId: { in: ids } } });
  await db.calendarFeedToken.deleteMany({ where: { userId: { in: ids } } });
  await db.quiz.deleteMany({ where: { lesson: { chapter: { courseId: state.courseId } } } });
  await db.course.delete({ where: { id: state.courseId } });
  await db.user.deleteMany({ where: { id: { in: [state.tutorId, state.studentId] } } });
  for (const id of [state.tutorId, state.studentId]) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) console.warn(`auth delete failed for ${id}: ${error.message}`);
  }
  fs.rmSync(STATE, { force: true });
  console.log("fixtures destroyed");
}

const cmd = process.argv[2];
if (cmd === "create" || cmd === "destroy") {
  (cmd === "destroy" ? destroy() : create())
    .then(() => db.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await db.$disconnect();
      process.exit(1);
    });
} else if (process.argv[1]?.endsWith("qa-fixture.ts")) {
  // No implicit default: this writes to the DB production shares.
  console.error("usage: tsx scripts/qa-fixture.ts <create|destroy> [statePath] [pdfPath]");
  process.exit(1);
}
