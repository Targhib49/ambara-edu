import { z } from "zod";
import {
  CHECK_FILE,
  ENTRY_FILE,
  projectCheckSchema,
  projectFileNameSchema,
  projectFilesSchema,
  projectRunSchema,
  projectStepSchema,
  type ProjectFiles,
} from "@/lib/projects/schema";

/**
 * A guided project as it's written: one file per project (see
 * docs/project-authoring.md), read by scripts/project.ts. Beyond what a student
 * sees, every step carries a reference solution, so the tool can run it and
 * prove the step's checks are right before the project reaches anyone.
 */

const filesMapSchema = z.record(projectFileNameSchema, z.string());

export const definitionStepSchema = z.object({
  stage: z.string().min(1),
  title: z.string().min(1),
  points: z.number().positive(),
  /** Markdown, shown in the guide. */
  instruction: z.string().min(1),
  example: projectRunSchema,
  /** Hidden checks: other input for main.py, or a `script` that tests the student's functions. */
  tests: z.array(projectCheckSchema).max(30).default([]),
  hint: z.string().default(""),
  /** Hints shown one at a time, from a nudge to nearly the answer. */
  hints: z.array(z.string().min(1)).max(4).default([]),
  /** Exact title of the lesson (in the same chapter) that teaches the step, linked from the guide. */
  lesson: z.string().min(1).optional(),
  /** Files that appear in the student's project when this step opens. */
  addFiles: filesMapSchema.default({}),
  /**
   * The reference answer: the files this step changes or adds, as they are
   * once the step is done. Merged onto the previous step's finished state —
   * list only what the step touches.
   */
  solution: filesMapSchema,
});
export type DefinitionStep = z.infer<typeof definitionStepSchema>;

export const projectDefinitionSchema = z
  .object({
    /** Course and chapter, matched by exact title. */
    course: z.string().min(1),
    chapter: z.string().min(1),
    title: z.string().min(1),
    /** Title of the lesson the project comes after; omit for the end of the chapter. */
    afterLesson: z.string().min(1).optional(),
    /** Exact titles of quizzes in the chapter this project replaces; archived on publish. */
    replaces: z.array(z.string().min(1)).default([]),
    files: projectFilesSchema,
    steps: z.array(definitionStepSchema).min(1).max(40),
  })
  .superRefine((def, ctx) => {
    const titles = new Set<string>();
    def.steps.forEach((step, i) => {
      if (titles.has(step.title)) {
        ctx.addIssue({ code: "custom", path: ["steps", i, "title"], message: `duplicate step title "${step.title}"` });
      }
      titles.add(step.title);
    });
  });
export type ProjectDefinition = z.infer<typeof projectDefinitionSchema>;
/** What a definition file writes: optional fields may be left out. */
export type ProjectDefinitionInput = z.input<typeof projectDefinitionSchema>;

/** A step with the states the tool checks it in. */
export type StepState = {
  index: number;
  step: DefinitionStep;
  /** What the student starts the step with: the previous step's finished files plus this step's new ones. */
  start: ProjectFiles;
  /** The same after the reference solution. */
  done: ProjectFiles;
};

/**
 * Walks the project the way a student would, assuming each step is solved
 * with its reference solution. A file a step adds never overwrites one the
 * student already has — the same rule the app applies.
 */
export function walkSteps(def: ProjectDefinition): StepState[] {
  const states: StepState[] = [];
  let current: ProjectFiles = { ...def.files };
  def.steps.forEach((step, index) => {
    const start = { ...current };
    for (const [name, text] of Object.entries(step.addFiles)) {
      if (!(name in start)) start[name] = text;
    }
    const done = { ...start, ...step.solution };
    states.push({ index, step, start, done });
    current = done;
  });
  return states;
}

/** The step as stored in the database: what the app needs, without the solution. */
export function toStoredStep(step: DefinitionStep, lessonId?: string) {
  return projectStepSchema.parse({
    stage: step.stage,
    title: step.title,
    example: step.example,
    tests: step.tests,
    hint: step.hint,
    hints: step.hints,
    lessonId,
    addFiles: step.addFiles,
    solution: step.solution,
  });
}

export { CHECK_FILE, ENTRY_FILE };
