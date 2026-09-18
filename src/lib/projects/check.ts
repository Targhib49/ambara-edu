"use client";

import { outputsMatch, runProject } from "@/lib/pyodideWorker";
import { ENTRY_FILE, type ProjectRun, type ProjectStep } from "@/lib/projects/schema";

export type CheckRun = {
  /** The example is shown to the student; hidden tests are only counted. */
  visible: boolean;
  input: string;
  expectedOutput: string;
  output: string;
  error: string | null;
  passed: boolean;
};

export type CheckResult = { passed: boolean; runs: CheckRun[] };

/**
 * Checks a step: runs the student's project with the example's input and with
 * every hidden test's, and passes only if each run prints what's expected
 * without an error. Runs in the browser — the server has no Python — so, like
 * code questions, the tutor's review is the backstop.
 */
export async function checkStep(files: Record<string, string>, step: ProjectStep): Promise<CheckResult> {
  const cases: (ProjectRun & { visible: boolean })[] = [
    { ...step.example, visible: true },
    ...step.tests.map((run) => ({ ...run, visible: false })),
  ];
  const results = await runProject(
    files,
    cases.map((c) => c.input),
    ENTRY_FILE
  );
  const runs = cases.map((c, i) => {
    const { output, error } = results[i];
    return {
      visible: c.visible,
      input: c.input,
      expectedOutput: c.expectedOutput,
      output,
      error,
      passed: !error && outputsMatch(output, c.expectedOutput),
    };
  });
  return { passed: runs.every((r) => r.passed), runs };
}
