# Authoring guided projects

A guided project is a program a student builds step by step in a small editor
beside a guide: files and tabs on one side, and on the other the current step,
what to type in, and what the program should print. **Cek** runs the program;
if it passes, the next step opens and the files carry over, so the program
grows as the student goes. It is graded, and replaces a chapter's stage
quizzes.

Projects are written as **one TypeScript file each** in `content/projects/`,
and put into the course with `scripts/project.ts`. The working example is
[`content/projects/rapor-sekolah.ts`](../content/projects/rapor-sekolah.ts)
(Basic Python › Modul 3) — start by copying it.

The source of truth is code: `src/lib/projects/definition.ts` (this format) and
`src/lib/projects/schema.ts` (what the app stores). If this page disagrees
with them, they win — and please fix this page.

## The workflow

```bash
npx tsx scripts/project.ts validate content/projects/<file>.ts   # no database needed
npx tsx scripts/project.ts plan     content/projects/<file>.ts   # what apply/publish would change
npx tsx scripts/project.ts apply    content/projects/<file>.ts   # create it as a DRAFT
npx tsx scripts/project.ts publish  content/projects/<file>.ts   # publish it, archive what it replaces
```

- **`validate`** walks the project exactly as a student would, applying each
  step's reference solution, and runs every step's example and hidden tests
  with `python3`. It fails if any solution doesn't print what its step
  expects, and warns when a step has no hidden tests, when every test expects
  the example's output (a hard-coded answer would pass), or when a step
  already passes with the files it starts from (it asks for no work).
  **Keep validating until it's clean.**
- **`apply`** creates the project as a **DRAFT**, invisible to students.
  `--replace-draft` rebuilds a draft that no student has opened. It refuses
  to touch a published project or one with students' work in it.
- The tutor tries it at *Coba proyek* on the project's page, which behaves
  exactly as the student's view but saves nothing.
- **`publish`** publishes it and archives the quizzes listed in `replaces`:
  each becomes a draft named `[Arsip] …`, detached from its lesson, with its
  submissions kept. Both happen in one transaction.

The database is shared with production. `apply` and `publish` refuse to run on
a project that doesn't validate, write a JSON backup to `backups/projects/`
first, and **need the tutor's OK** before being run.

## The file

```ts
import type { ProjectDefinitionInput } from "../../src/lib/projects/definition";

export default {
  course: "Basic Python",                                  // exact course title
  chapter: "Modul 3: Proyek Akhir — Sistem Rapor Sekolah", // exact chapter title
  title: "Proyek Akhir: Sistem Rapor Sekolah",
  afterLesson: undefined,       // a lesson's exact title, or leave out for the end of the chapter
  replaces: ["Tahap 1: … — Latihan Kode"],   // exact titles of quizzes it replaces
  files: { "main.py": "…", "data.py": "…" }, // what the student starts with
  steps: [ /* see below */ ],
} satisfies ProjectDefinitionInput;
```

### Files

- The program always runs from **`main.py`**, so it must be in `files`.
- Names are plain relative paths ending in `.py`, `.txt`, `.csv`, `.json` or
  `.md`; folders are fine (`lib/data.py`), absolute paths and `..` are not.
- At most 20 files and 200,000 characters in all.
- A module is imported the ordinary way (`from data import data_nilai`), and
  `open("nilai.csv")` reads a file next to `main.py`.

### A step

```ts
{
  stage: "Tahap 2: Rata-Rata & Nilai Huruf",   // consecutive steps sharing one are grouped
  title: "Rata-rata dan nilai huruf",           // unique within the project
  points: 3,
  instruction: `Markdown shown in the guide …`,
  example: { input: "Dewi", expectedOutput: `…` },   // shown to the student
  tests: [{ input: "Andi", expectedOutput: `…` }],   // hidden; up to 20
  hint: "one line, shown on request",
  addFiles: { "nilai.py": "…" },       // files that appear when this step opens
  solution: { "main.py": "…", "nilai.py": "…" },     // the reference answer
}
```

- **`stage`** is how the guide groups steps; use the chapter's own stage names
  (the Tahap titles) so the project matches the lessons around it.
- **`instruction`** is Markdown: tables, lists and `code` work. Say exactly
  what the program should print, and point at the lesson that teaches the
  idea ("lihat pelajaran **Tahap 3**").
- **`example`** is shown to the student, input and expected output both. The
  input is typed into the *Input* box, one line per `input()` call.
- **`tests`** are hidden. A check passes only if the example **and** every test
  print exactly what's expected, so write tests with **different input** — a
  program that just prints the example's output then fails. When a test
  fails, the student sees its input and what their program printed, never
  the expected output.
- **`addFiles`** appear when the step opens. A file the student already has is
  never overwritten — so to change a file's shape (say, the data gets a new
  level), add a **new** file and have the step switch to it, as Tahap 3 does
  with `data_lengkap.py`. Give an added module TODO stubs: the functions'
  names and comments, with `pass`.
- **`solution`** is the reference answer: the files **this step** changes or
  adds, as they are once the step is done. It's merged onto the previous
  step's finished files, so list only what the step touches. It never reaches
  students; `validate` runs it.

### How output is compared

Exactly, line by line, except that **spaces at the end of a line and blank
lines at the end** don't count. So:

- Every character matters, including spacing inside a line and capitals.
- A program that stops with an error fails the check.
- **Tell students to call `input()` with no text inside.** `input("Nama: ")`
  prints `Nama: `, and their output no longer matches. The rapor project says
  so in step 1.

### Scoring

Each step's points are kept in full if its check passes the first time, 75%
after one failed check, and never less than half. The finished project goes
to the tutor's review queue with that score, and the tutor sets the final
score from the student's code — up or down. There's no penalty for Run, only
for Cek, so students can try things freely.

## Writing a good project

- **Keep one program all the way through.** The point of a project over a
  set of exercises is that the code carries over; each step should build on
  the last, not start something new.
- **Small steps.** One idea per step; around 8–12 steps for a chapter.
  A student who fails a step has to fix it before moving on.
- **Make output depend on input.** Steps whose output never changes can only
  be checked against the example, which a student can copy.
- **Keep the chapter's theme**: its data, names and examples. When converting
  lessons into a project, the lessons stay as the teaching material; the
  project replaces the graded exercises.
- **Write in the course's voice.** For the Indonesian courses: casual,
  second person *kamu*.
