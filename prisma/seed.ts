import "dotenv/config";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Role, StudentGroup } from "../src/generated/prisma/enums";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ATTACHMENTS_BUCKET = "attachments";

/** Create (or find) a Supabase auth user and upsert the matching app User row. */
async function upsertUser(opts: {
  email: string;
  password: string;
  name: string;
  role: Role;
  studentGroup?: StudentGroup;
}) {
  let authId: string;
  const { data, error } = await supabase.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
  });
  if (error) {
    // Already exists — look it up so the seed is idempotent
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email === opts.email);
    if (!existing) throw new Error(`Could not create or find auth user ${opts.email}: ${error.message}`);
    authId = existing.id;
  } else {
    authId = data.user.id;
  }

  return db.user.upsert({
    where: { id: authId },
    create: {
      id: authId,
      email: opts.email,
      name: opts.name,
      role: opts.role,
      studentGroup: opts.studentGroup ?? null,
    },
    update: { name: opts.name, role: opts.role, studentGroup: opts.studentGroup ?? null },
  });
}

async function main() {
  // Private storage bucket for file attachments
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === ATTACHMENTS_BUCKET)) {
    const { error } = await supabase.storage.createBucket(ATTACHMENTS_BUCKET, { public: false });
    if (error) throw error;
    console.log(`Created private bucket "${ATTACHMENTS_BUCKET}"`);
  }

  const tutor = await upsertUser({
    email: process.env.SEED_TUTOR_EMAIL!,
    password: process.env.SEED_TUTOR_PASSWORD!,
    name: "Targhib (Tutor)",
    role: "TUTOR",
  });
  console.log(`Tutor: ${tutor.email}`);

  const alice = await upsertUser({
    email: "alice.student@example.com",
    password: process.env.SEED_STUDENT_PASSWORD!,
    name: "Alice Ahmad",
    role: "STUDENT",
    studentGroup: "JUNIOR_HIGH",
  });
  const bob = await upsertUser({
    email: "bob.student@example.com",
    password: process.env.SEED_STUDENT_PASSWORD!,
    name: "Bob Rahman",
    role: "STUDENT",
    studentGroup: "GRAD",
  });
  console.log(`Students: ${alice.email}, ${bob.email}`);

  // Wipe seed-owned content so re-running gives a clean slate
  await db.track.deleteMany({ where: { title: { in: ["Junior High Math", "Control Systems"] } } });

  await db.track.create({
    data: {
      title: "Junior High Math",
      description: "Fractions, algebra basics, and a first taste of coding.",
      ownerId: tutor.id,
      enrollments: { create: [{ studentId: alice.id }] },
      modules: {
        create: [
          {
            title: "Week 1: Fractions",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Adding fractions",
                  order: 0,
                  status: "PUBLISHED",
                  blocks: {
                    create: [
                      {
                        order: 0,
                        type: "MARKDOWN",
                        data: {
                          markdown:
                            "# Adding fractions\n\nTo add fractions you need a **common denominator**.\n\n1. Find the least common multiple of both denominators\n2. Rewrite each fraction\n3. Add the numerators\n\nFor example, $\\frac{1}{2} + \\frac{1}{3}$ becomes:",
                        },
                      },
                      {
                        order: 1,
                        type: "EQUATION",
                        data: {
                          latex: "\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}",
                          display: true,
                        },
                      },
                      {
                        order: 2,
                        type: "MARKDOWN",
                        data: {
                          markdown:
                            "We can check this with a tiny bit of Python:",
                        },
                      },
                      {
                        order: 3,
                        type: "CODE_SNIPPET",
                        data: {
                          language: "python",
                          code: "from fractions import Fraction\n\nprint(Fraction(1, 2) + Fraction(1, 3))  # 5/6",
                        },
                      },
                    ],
                  },
                },
                {
                  title: "Multiplying fractions (draft)",
                  order: 1,
                  status: "DRAFT",
                  blocks: {
                    create: [
                      {
                        order: 0,
                        type: "MARKDOWN",
                        data: { markdown: "Work in progress — multiply straight across." },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await db.track.create({
    data: {
      title: "Control Systems",
      description: "Classical control: transfer functions, time response, frequency response.",
      ownerId: tutor.id,
      enrollments: { create: [{ studentId: bob.id }] },
      modules: {
        create: [
          {
            title: "Week 1: Transfer Functions",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Second-order systems",
                  order: 0,
                  status: "PUBLISHED",
                  blocks: {
                    create: [
                      {
                        order: 0,
                        type: "MARKDOWN",
                        data: {
                          markdown:
                            "# Second-order systems\n\nThe canonical second-order transfer function is parameterized by the natural frequency $\\omega_n$ and damping ratio $\\zeta$:",
                        },
                      },
                      {
                        order: 1,
                        type: "EQUATION",
                        data: {
                          latex: "G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta\\omega_n s + \\omega_n^2}",
                          display: true,
                        },
                      },
                      {
                        order: 2,
                        type: "CODE_SNIPPET",
                        data: {
                          language: "python",
                          code: "import control as ct\n\nwn, zeta = 2.0, 0.5\nG = ct.tf([wn**2], [1, 2*zeta*wn, wn**2])\nprint(ct.step_info(G))",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded 2 tracks with modules, lessons and content blocks.");

  // --- Sessions: cover every status reachable in Phase 2 (PROPOSED is schema-only for now) ---
  await db.session.deleteMany({ where: { tutorId: tutor.id } });

  const addDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(16, 0, 0, 0);
    return d;
  };

  await db.session.createMany({
    data: [
      // Bob: plain upcoming session
      {
        studentId: bob.id,
        tutorId: tutor.id,
        startTime: addDays(3),
        durationMinutes: 60,
        status: "CONFIRMED",
      },
      // Bob: completed session with a post-session log
      {
        studentId: bob.id,
        tutorId: tutor.id,
        startTime: addDays(-7),
        durationMinutes: 60,
        status: "CONFIRMED",
        notes:
          "Reviewed second-order step response and damping ratio intuition. Assign the Bode plot problem set for next time.",
      },
      // Bob: requested a reschedule, awaiting tutor response
      {
        studentId: bob.id,
        tutorId: tutor.id,
        startTime: addDays(5),
        durationMinutes: 60,
        status: "RESCHEDULE_REQUESTED_BY_STUDENT",
        proposedAltTime: addDays(7),
      },
      // Bob: a cancelled session
      {
        studentId: bob.id,
        tutorId: tutor.id,
        startTime: addDays(10),
        durationMinutes: 45,
        status: "CANCELLED",
      },
      // Alice: plain upcoming session
      {
        studentId: alice.id,
        tutorId: tutor.id,
        startTime: addDays(2),
        durationMinutes: 45,
        status: "CONFIRMED",
      },
      // Alice: tutor proposed a new time, awaiting her response
      {
        studentId: alice.id,
        tutorId: tutor.id,
        startTime: addDays(4),
        durationMinutes: 45,
        status: "RESCHEDULE_REQUESTED_BY_TUTOR",
        proposedAltTime: addDays(6),
      },
    ],
  });
  console.log("Seeded 6 sessions across every reschedule-flow status.");

  // --- Quizzes: cover every Submission status (auto_graded, pending_review, reviewed) ---
  const fractionsLesson = await db.lesson.findFirstOrThrow({ where: { title: "Adding fractions" } });
  const systemsLesson = await db.lesson.findFirstOrThrow({ where: { title: "Second-order systems" } });

  await db.quiz.deleteMany({ where: { title: { in: ["Fractions Check", "Fractions Challenge", "Systems Quiz"] } } });

  // Quiz 1: fully auto-gradable, Alice answers everything correctly -> AUTO_GRADED
  const fractionsCheck = await db.quiz.create({
    data: {
      title: "Fractions Check",
      lessonId: fractionsLesson.id,
      importBatchId: randomUUID(),
      questions: {
        create: [
          {
            order: 0,
            type: "MULTIPLE_CHOICE",
            prompt: "1/2 + 1/3 = ?",
            points: 1,
            options: ["5/6", "1", "2/5", "3/6"],
            correctAnswer: { letter: "A" },
            explanation: "Common denominator 6: 3/6 + 2/6 = 5/6.",
          },
          {
            order: 1,
            type: "NUMERIC",
            prompt: "What is 2 × 3.14?",
            points: 1,
            correctAnswer: { value: 6.28, tolerance: 0.05 },
            explanation: "2 × 3.14 = 6.28.",
          },
          {
            order: 2,
            type: "SHORT_TEXT",
            prompt: "Simplify 4/8 to lowest terms.",
            points: 1,
            correctAnswer: { kind: "exact", value: "1/2" },
            explanation: "4/8 = 1/2 after dividing both by 4.",
          },
        ],
      },
    },
    include: { questions: true },
  });

  await db.submission.create({
    data: {
      studentId: alice.id,
      quizId: fractionsCheck.id,
      answers: fractionsCheck.questions.map((q) => ({
        questionId: q.id,
        response:
          q.type === "MULTIPLE_CHOICE"
            ? { letter: "A" }
            : q.type === "NUMERIC"
              ? { value: 6.28 }
              : { value: "1/2" },
      })),
      autoScore: 3,
      status: "AUTO_GRADED",
    },
  });

  // Quiz 2: includes a short_text near-miss and a code question -> PENDING_REVIEW
  const fractionsChallenge = await db.quiz.create({
    data: {
      title: "Fractions Challenge",
      lessonId: fractionsLesson.id,
      importBatchId: randomUUID(),
      questions: {
        create: [
          {
            order: 0,
            type: "MULTI_SELECT",
            prompt: "Which of these are proper fractions (numerator < denominator)?",
            points: 1,
            options: ["1/2", "3/2", "2/3", "5/4"],
            correctAnswer: { letters: ["A", "C"] },
            explanation: "1/2 and 2/3 have a smaller numerator than denominator.",
          },
          {
            order: 1,
            type: "SHORT_TEXT",
            prompt: "What do we call a fraction where the numerator is larger than the denominator?",
            points: 1,
            correctAnswer: { kind: "exact", value: "improper fraction" },
            explanation: "That's an improper fraction.",
          },
          {
            order: 2,
            type: "CODE",
            prompt: "Write a function that reduces a fraction to lowest terms.",
            points: 2,
            correctAnswer: {},
            explanation: "",
          },
        ],
      },
    },
    include: { questions: true },
  });

  await db.submission.create({
    data: {
      studentId: alice.id,
      quizId: fractionsChallenge.id,
      answers: [
        { questionId: fractionsChallenge.questions[0].id, response: { letters: ["A", "C"] } },
        { questionId: fractionsChallenge.questions[1].id, response: { value: "improper" } },
        {
          questionId: fractionsChallenge.questions[2].id,
          response: { code: "def reduce_fraction(n, d):\n    from math import gcd\n    g = gcd(n, d)\n    return n // g, d // g" },
        },
      ],
      autoScore: 1, // multi_select only — short_text near-miss and code are pending
      status: "PENDING_REVIEW",
    },
  });

  // Quiz 3: Bob answers a near-miss short_text; already reviewed by the tutor -> REVIEWED
  const systemsQuiz = await db.quiz.create({
    data: {
      title: "Systems Quiz",
      lessonId: systemsLesson.id,
      importBatchId: randomUUID(),
      questions: {
        create: [
          {
            order: 0,
            type: "MULTIPLE_CHOICE",
            prompt: "For ζ = 1, the system response is:",
            points: 1,
            options: ["Overdamped", "Critically damped", "Underdamped", "Undamped"],
            correctAnswer: { letter: "B" },
            explanation: "ζ = 1 is exactly the critically damped case.",
          },
          {
            order: 1,
            type: "NUMERIC",
            prompt: "For G(s) = 4/(s² + 4s + 4), what is ωn (rad/s)?",
            points: 1,
            correctAnswer: { value: 2, tolerance: 0.1 },
            explanation: "ωn² = 4, so ωn = 2 rad/s.",
          },
          {
            order: 2,
            type: "SHORT_TEXT",
            prompt: "What does ζ (zeta) stand for in this model?",
            points: 1,
            correctAnswer: { kind: "exact", value: "damping ratio" },
            explanation: "ζ is the damping ratio.",
          },
        ],
      },
    },
    include: { questions: true },
  });

  await db.submission.create({
    data: {
      studentId: bob.id,
      quizId: systemsQuiz.id,
      answers: [
        { questionId: systemsQuiz.questions[0].id, response: { letter: "B" } },
        { questionId: systemsQuiz.questions[1].id, response: { value: 2 } },
        { questionId: systemsQuiz.questions[2].id, response: { value: "damping factor" } },
      ],
      autoScore: 2, // MC + numeric matched automatically
      manualScore: 1, // tutor gave credit for the near-miss short_text answer
      status: "REVIEWED",
      feedback: "Close enough — I'll count \"damping factor\" as correct here.",
    },
  });

  console.log("Seeded 3 quizzes with submissions covering auto_graded, pending_review, and reviewed.");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
