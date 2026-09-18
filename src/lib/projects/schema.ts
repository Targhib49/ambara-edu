import { z } from "zod";

/**
 * The shape of a guided project: a quiz with style PROJECT whose questions are
 * PROJECT_STEP steps, and whose starter files live on the quiz. The student's
 * program runs from ENTRY_FILE, and the files carry over from step to step, so
 * the project grows as they go.
 */

/** Every project runs from this file, like `python main.py`. */
export const ENTRY_FILE = "main.py";

const MAX_FILES = 20;
/** Big enough for any teaching project; small enough to keep a row light. */
const MAX_TOTAL_CHARS = 200_000;

/**
 * A file's path inside the project: plain names and folders only, no absolute
 * paths or "..", so a file can never be written outside the project's folder.
 */
export const projectFileNameSchema = z
  .string()
  .regex(/^(?!\/)(?!.*\.\.)[A-Za-z0-9_\-./]+\.(py|txt|csv|json|md)$/, "a project file must be a .py, .txt, .csv, .json or .md name, with no leading / or ..");

export const projectFilesSchema = z
  .record(projectFileNameSchema, z.string())
  .refine((files) => ENTRY_FILE in files, { message: `a project needs ${ENTRY_FILE}` })
  .refine((files) => !("_cek_langkah.py" in files), { message: "_cek_langkah.py is reserved for checks" })
  .refine((files) => Object.keys(files).length <= MAX_FILES, { message: `at most ${MAX_FILES} files` })
  .refine((files) => Object.values(files).reduce((n, text) => n + text.length, 0) <= MAX_TOTAL_CHARS, {
    message: "the files are too large",
  });
export type ProjectFiles = z.infer<typeof projectFilesSchema>;

/** One run of the program: what's typed in, and what should come out. */
export const projectRunSchema = z.object({
  input: z.string().default(""),
  expectedOutput: z.string(),
});
export type ProjectRun = z.infer<typeof projectRunSchema>;

/** The file a check script runs as, beside the student's files. Reserved: a student can't make it. */
export const CHECK_FILE = "_cek_langkah.py";

/**
 * A hidden check. Either the student's program run with other input, or —
 * with `script` — a small Python program run in place of main.py, beside the
 * student's files, that imports their modules and prints what it finds: how
 * the old lessons' "alat cek" tested functions on their edge cases.
 *
 * A failed input check shows its input and what the program printed, never
 * the expected output. A failed script check shows its `label`, what it
 * printed and what was expected ("nilai_huruf(89.9) -> dapat C, harusnya B"),
 * since that names the one case to fix without giving the program away.
 */
export const projectCheckSchema = projectRunSchema.extend({
  script: z.string().min(1).optional(),
  /** What a script check tests, e.g. "nilai_huruf(89.9)". */
  label: z.string().default(""),
});
export type ProjectCheck = z.infer<typeof projectCheckSchema>;

/**
 * One step, stored as a PROJECT_STEP question's correctAnswer. The question's
 * prompt is the instruction, its points what the step is worth.
 *
 * A check runs the program with the example's input and with every hidden
 * test's, and passes only if all of them print what's expected — so printing
 * the example's output by hand isn't enough.
 */
export const projectStepSchema = z.object({
  /** The stage (a Tahap) the step belongs to; consecutive steps sharing one are grouped. */
  stage: z.string().min(1),
  title: z.string().min(1),
  /** Shown to the student: what to type in, and what the program should print. */
  example: projectRunSchema,
  /** Checked but not shown. */
  tests: z.array(projectCheckSchema).max(30).default([]),
  /** One-line hint — kept for projects written before `hints`. */
  hint: z.string().default(""),
  /** Hints shown one at a time, from a nudge to nearly the answer. */
  hints: z.array(z.string().min(1)).max(4).default([]),
  /** The lesson that teaches this step's idea, linked from the guide. */
  lessonId: z.string().uuid().optional(),
  /** Files that appear in the student's project when this step opens, e.g. a data.py to import. */
  addFiles: z.record(projectFileNameSchema, z.string()).default({}),
});
export type ProjectStep = z.infer<typeof projectStepSchema>;

/** A step's answer in the submission: whether it passed, and after how many failed checks. */
export const projectStepResponseSchema = z.object({
  passed: z.boolean().default(false),
  failedChecks: z.number().int().min(0).default(0),
});

/**
 * Share of a step's points kept, by failed checks before it passed: all of it
 * on the first check, then 75%, then never less than half. Targhib's call: a
 * student can't move on until a check passes, so everyone who finishes has
 * passed every step — what separates them is how many tries it took.
 */
export function projectStepShare(failedChecks: number): number {
  if (failedChecks <= 0) return 1;
  if (failedChecks === 1) return 0.75;
  return 0.5;
}

/** A step's hints in order: `hints` if written, otherwise the single `hint`. */
export function stepHints(step: { hint: string; hints: string[] }): string[] {
  if (step.hints.length) return step.hints;
  return step.hint ? [step.hint] : [];
}
