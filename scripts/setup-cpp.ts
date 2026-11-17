/**
 * Builds the C++ object-oriented programming course from the five lecture
 * PDFs in `../C++` (sibling of this repo): one chapter, one lesson per module,
 * each lesson a short outline followed by the module's slides shown inline,
 * and one exercise (a graded quiz) per lesson from scripts/content/cpp-oop.ts.
 * Run scripts/check-cpp.ts first: it compiles every program in the exercises
 * and confirms the answer keys.
 *
 *   npx tsx scripts/setup-cpp.ts plan                      read-only: what apply would create
 *   npx tsx scripts/setup-cpp.ts apply                     creates the course as a DRAFT
 *   npx tsx scripts/setup-cpp.ts apply --publish           creates it PUBLISHED
 *   npx tsx scripts/setup-cpp.ts apply --enroll a@b.com    also enrolls that student (repeatable)
 *
 * This runs against whatever `.env` points at — the local stack. For the live
 * site:  npm run prod -- npx tsx scripts/setup-cpp.ts apply ...
 *
 * It only adds. If the course already exists its lessons are left alone;
 * an exercise is added only where a lesson has no quiz of that title yet,
 * `--enroll` adds a missing enrollment, and `--publish` publishes a draft
 * course and any draft exercises. Existing questions are never rewritten. A PDF whose lesson fails to save is removed from storage.
 *
 * The slides are a lecturer's own course material, so the course is created
 * with ENROLLED access: only students added to it can open it.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockDataSchemas } from "../src/lib/blocks/schema";
import { parseCorrectAnswer } from "../src/lib/quiz/schema";
import { CPP_EXERCISES, PRELUDE, outputPrompt, type CppQuestion } from "./content/cpp-oop";

const SOURCE_DIR = path.resolve(__dirname, "../../C++");
const BUCKET = "attachments";
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // the app's own attachment limit

const COURSE_TITLE = "C++ Programming 2: Object-Oriented Programming";
const COURSE_DESCRIPTION =
  "Classes and objects, separating interface from implementation, composition, operator overloading and inheritance in C++.";
const CHAPTER_TITLE = "Object-Oriented Programming in C++";

type Module = { file: string; title: string; covers: string[] };

// `covers` follows the slide headings of each deck, in order.
const MODULES: Module[] = [
  {
    file: "1_Intro to Classes.pdf",
    title: "Module 1 — Introduction to Classes",
    covers: [
      "Procedural versus object-oriented programming",
      "Defining a class: members, access specifiers, member functions",
      "Declaring objects and accessing their members",
      "Constructors (default, with parameters, default arguments, overloaded, `explicit`) and destructors",
      "Member initializer lists",
      "Case study: the `Time` class, and an array of class objects",
    ],
  },
  {
    file: "2_Classes Interface and Implementation.pdf",
    title: "Module 2 — Interface and Implementation",
    covers: [
      "Splitting a class into a header file and an implementation file",
      "Accessor and mutator (get/set) functions",
      "`const` objects, member functions and data",
      "`static` class members",
      "Memberwise assignment and the `this` pointer",
      "Dynamic memory with `new` and `delete`; object references and pointers",
      "`struct` versus `class`",
    ],
  },
  {
    file: "3_Composition.pdf",
    title: "Module 3 — Composition",
    covers: [
      "Composition: objects as members of other classes (the “has-a” relationship)",
      "Two worked composition examples",
      "`friend` functions and `friend` classes",
      "Proxy classes for hiding implementation details",
    ],
  },
  {
    file: "4_Operator Overloading.pdf",
    title: "Module 4 — Operator Overloading",
    covers: [
      "Which operators can be overloaded, and the rules that apply",
      "Overloading arithmetic operators such as `+`",
      "Overloading the stream operators `<<` and `>>`",
      "Overloading prefix and postfix `++`",
      "Case study: a `Complex` number class",
    ],
  },
  {
    file: "5_Inheritance.pdf",
    title: "Module 5 — Inheritance",
    covers: [
      "Base and derived classes; inheritance versus composition",
      "Public, protected and private inheritance",
      "Constructors of derived and base classes",
      "`protected` data members",
      "Multilevel and multiple inheritance",
      "The diamond problem and virtual inheritance",
    ],
  },
];

function intro(m: Module): string {
  return [
    "**In this module**",
    "",
    ...m.covers.map((c) => `- ${c}`),
    "",
    "The slides are below. Use the full-screen button on the reader for a larger view, and type out the code examples yourself as you go — reading them is not the same as running them.",
  ].join("\n");
}

const withPrelude = (source: string) => (source.includes("#include") ? source : PRELUDE + source);
const fence = (code: string) => "```cpp\n" + code + "\n```";

// The working box is Markdown: unfenced, "#include <iostream>" turns into a heading
// with the header name swallowed. The hint is one line so it isn't read as a fence itself.
const PASTE_HINT =
  "When you paste code into the working box, put a line with only three backticks (```) before it and another after it, so it is displayed as code.";

/** Turns one authored question into the row the app stores. */
function questionRow(q: CppQuestion) {
  switch (q.kind) {
    case "choice":
      return {
        type: "MULTIPLE_CHOICE" as const,
        prompt: q.prompt,
        options: q.options,
        correctAnswer: parseCorrectAnswer("MULTIPLE_CHOICE", { letter: q.answer }),
      };
    case "output": {
      const prompt = `${outputPrompt(q)}\n${fence(withPrelude(q.program))}`;
      // A plain number goes in a number field; anything else is matched as text.
      return /^-?\d+(\.\d+)?$/.test(q.prints)
        ? { type: "NUMERIC" as const, prompt, options: [], correctAnswer: parseCorrectAnswer("NUMERIC", { value: Number(q.prints), tolerance: 0 }) }
        : { type: "SHORT_TEXT" as const, prompt, options: [], correctAnswer: parseCorrectAnswer("SHORT_TEXT", { kind: "exact", value: q.prints }) };
    }
    case "mistake":
      return {
        type: "FIND_MISTAKE" as const,
        prompt: `${q.prompt} (The #include lines and using namespace std; are not shown.)`,
        options: [],
        // No typed correction: a line of code retyped by hand almost never matches
        // character for character, and a near miss would be marked wrong.
        correctAnswer: parseCorrectAnswer("FIND_MISTAKE", { lines: q.lines, wrongIndex: q.wrongIndex, correction: "" }),
      };
    case "write": {
      const solution = [
        ...Object.entries(q.files).map(([name, source]) => `**${name}**\n\n${fence(name.endsWith(".cpp") ? withPrelude(source) : source)}`),
        q.explanation,
      ].join("\n\n");
      return {
        type: "WORKED" as const,
        prompt: `${q.prompt}\n${PASTE_HINT}`,
        options: [],
        correctAnswer: parseCorrectAnswer("WORKED", { finalAnswer: q.prints, answerMarks: 1, rubric: q.rubric, solution }),
      };
    }
  }
}

const [mode = "plan", ...flags] = process.argv.slice(2);
if (mode !== "plan" && mode !== "apply") {
  console.error("usage: npx tsx scripts/setup-cpp.ts <plan|apply> [--publish] [--enroll <email>]...");
  process.exit(1);
}
const publish = flags.includes("--publish");
const enrollEmails = flags.flatMap((f, i) => (f === "--enroll" && flags[i + 1] ? [flags[i + 1].toLowerCase()] : []));

function validate() {
  const problems: string[] = [];
  for (const m of MODULES) {
    const file = path.join(SOURCE_DIR, m.file);
    if (!fs.existsSync(file)) problems.push(`missing ${file}`);
    else if (fs.statSync(file).size > MAX_UPLOAD_BYTES) problems.push(`${m.file} is over the 3 MB attachment limit`);
    try {
      blockDataSchemas.MARKDOWN.parse({ markdown: intro(m) });
    } catch (e) {
      problems.push(`${m.title}: intro invalid: ${(e as Error).message}`);
    }
  }
  for (const e of CPP_EXERCISES) {
    if (!MODULES.some((m) => m.file === e.moduleFile)) problems.push(`${e.title}: no module uses ${e.moduleFile}`);
    e.questions.forEach((q, i) => {
      try {
        questionRow(q);
      } catch (err) {
        problems.push(`${e.title} #${i + 1}: ${(err as Error).message}`);
      }
      if (q.points <= 0) problems.push(`${e.title} #${i + 1}: points must be positive`);
      // One mark for the stated output, the rest for the working — so the points must add up.
      if (q.kind === "write" && q.points !== 1 + q.rubric.reduce((n, r) => n + r.marks, 0))
        problems.push(`${e.title} #${i + 1}: points should be 1 + the rubric marks`);
    });
  }
  if (problems.length) {
    console.error(`✗ ${problems.length} problem(s):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
}

async function main() {
  validate();
  const dbHost = new URL(process.env.DATABASE_URL!).host;
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    console.log(`database: ${dbHost}`);

    const students = await db.user.findMany({ where: { email: { in: enrollEmails }, role: "STUDENT" } });
    const unknown = enrollEmails.filter((e) => !students.some((s) => s.email.toLowerCase() === e));
    if (unknown.length) throw new Error(`no student account for: ${unknown.join(", ")} — create it in the app first (Siswa → Tambah siswa)`);

    let course = await db.course.findFirst({ where: { title: COURSE_TITLE }, include: { enrollments: true } });
    const status = publish ? "PUBLISHED" : "DRAFT";

    if (course) {
      console.log(`course "${COURSE_TITLE}" already exists (${course.status}) — its lessons are left as they are`);
    } else {
      console.log(`course "${COURSE_TITLE}" — will be created as ${status}, access ENROLLED`);
      console.log(`  chapter: ${CHAPTER_TITLE}`);
      for (const m of MODULES) {
        const kb = Math.round(fs.statSync(path.join(SOURCE_DIR, m.file)).size / 1024);
        console.log(`    ${m.title.padEnd(44)} ${m.file} (${kb} KB)`);
      }
    }
    const toEnroll = students.filter((s) => !course?.enrollments.some((e) => e.studentId === s.id));
    for (const s of students) console.log(`  enroll ${s.email}: ${toEnroll.includes(s) ? "yes" : "already enrolled"}`);
    const willPublish = !!course && publish && course.status !== "PUBLISHED";
    if (willPublish) console.log("  status: DRAFT → PUBLISHED");

    // Exercises: one quiz per lesson, added where the lesson doesn't have it yet.
    const existingLessons = course
      ? await db.lesson.findMany({ where: { chapter: { courseId: course.id } }, include: { quizzes: { select: { id: true, title: true, status: true } } } })
      : [];
    const exercisePlan = CPP_EXERCISES.map((exercise) => {
      const moduleTitle = MODULES.find((m) => m.file === exercise.moduleFile)!.title;
      const lesson = existingLessons.find((l) => l.title === moduleTitle);
      const quiz = lesson?.quizzes.find((q) => q.title === exercise.title);
      return { exercise, moduleTitle, quiz };
    });
    for (const { exercise, quiz } of exercisePlan) {
      const points = exercise.questions.reduce((n, q) => n + q.points, 0);
      const what = quiz
        ? `already there (${quiz.status})${publish && quiz.status !== "PUBLISHED" ? " → PUBLISHED" : ""}`
        : `add as ${status}: ${exercise.questions.length} questions, ${points} points`;
      console.log(`  exercise "${exercise.title}": ${what}`);
    }

    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    if (!course) {
      const tutors = await db.user.findMany({ where: { role: "TUTOR" } });
      if (tutors.length !== 1) throw new Error(`expected exactly one tutor to own the course, found ${tutors.length}`);

      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Upload first, so the database write below is a single all-or-nothing create.
      const uploaded: { lessonId: string; storagePath: string; sizeBytes: number }[] = [];
      try {
        for (const m of MODULES) {
          const lessonId = randomUUID();
          const bytes = fs.readFileSync(path.join(SOURCE_DIR, m.file));
          const safeName = m.file.replace(/[^A-Za-z0-9._-]+/g, "-");
          const storagePath = `${lessonId}/${randomUUID()}-${safeName}`;
          const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "application/pdf" });
          if (error) throw new Error(`upload ${m.file}: ${error.message}`);
          uploaded.push({ lessonId, storagePath, sizeBytes: bytes.length });
        }

        course = await db.course.create({
          data: {
            title: COURSE_TITLE,
            description: COURSE_DESCRIPTION,
            status,
            access: "ENROLLED",
            ownerId: tutors[0].id,
            chapters: {
              create: {
                title: CHAPTER_TITLE,
                order: 0,
                lessons: {
                  create: MODULES.map((m, i) => ({
                    id: uploaded[i].lessonId,
                    title: m.title,
                    order: i,
                    status: "PUBLISHED" as const,
                    blocks: {
                      create: [
                        { order: 0, type: "MARKDOWN" as const, data: blockDataSchemas.MARKDOWN.parse({ markdown: intro(m) }) },
                        {
                          order: 1,
                          type: "FILE_ATTACHMENT" as const,
                          data: blockDataSchemas.FILE_ATTACHMENT.parse({
                            storagePath: uploaded[i].storagePath,
                            fileName: m.file,
                            mimeType: "application/pdf",
                            sizeBytes: uploaded[i].sizeBytes,
                            display: "inline",
                          }),
                        },
                      ],
                    },
                  })),
                },
              },
            },
          },
          include: { enrollments: true },
        });
      } catch (e) {
        if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded.map((u) => u.storagePath));
        throw e;
      }
      console.log(`✓ created course with ${MODULES.length} lessons (${status})`);
    } else if (willPublish) {
      await db.course.update({ where: { id: course.id }, data: { status: "PUBLISHED" } });
      console.log("✓ published");
    }

    const lessons = await db.lesson.findMany({ where: { chapter: { courseId: course.id } }, select: { id: true, title: true, chapterId: true } });
    for (const { exercise, moduleTitle, quiz } of exercisePlan) {
      if (quiz) {
        if (publish && quiz.status !== "PUBLISHED") {
          await db.quiz.update({ where: { id: quiz.id }, data: { status: "PUBLISHED" } });
          console.log(`✓ published "${exercise.title}"`);
        }
        continue;
      }
      const lesson = lessons.find((l) => l.title === moduleTitle);
      if (!lesson) throw new Error(`lesson "${moduleTitle}" not found in the course — was it renamed?`);
      await db.quiz.create({
        data: {
          title: exercise.title,
          chapterId: lesson.chapterId,
          lessonId: lesson.id,
          status,
          style: "CLASSIC",
          questions: {
            create: exercise.questions.map((q, order) => ({ order, points: q.points, explanation: q.explanation, ...questionRow(q) })),
          },
        },
      });
      console.log(`✓ added "${exercise.title}" (${status})`);
    }

    for (const s of toEnroll) {
      await db.enrollment.create({ data: { studentId: s.id, courseId: course.id } });
      console.log(`✓ enrolled ${s.email}`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
