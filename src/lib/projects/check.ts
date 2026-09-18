"use client";

import { outputsMatch, runProject } from "@/lib/pyodideWorker";
import { ENTRY_FILE, type ProjectRun } from "@/lib/projects/schema";

export type CheckRun = {
  /** The first run is the step's example, which the student sees; the rest are hidden tests. */
  visible: boolean;
  input: string;
  expectedOutput: string;
  output: string;
  error: string | null;
  passed: boolean;
};

export type CheckResult = { passed: boolean; runs: CheckRun[] };

/**
 * Checks a step: runs the student's project once per run — the example first,
 * then the hidden tests — and passes only if each prints what's expected
 * without an error. So printing the example's output by hand isn't enough.
 * Runs in the browser, since the server has no Python; the runs themselves
 * come from the server, for the current step only.
 */
export async function checkRuns(files: Record<string, string>, runs: ProjectRun[]): Promise<CheckResult> {
  const results = await runProject(
    files,
    runs.map((r) => r.input),
    ENTRY_FILE
  );
  const checked = runs.map((run, i) => {
    const { output, error } = results[i];
    return {
      visible: i === 0,
      input: run.input,
      expectedOutput: run.expectedOutput,
      output,
      error,
      passed: !error && outputsMatch(output, run.expectedOutput),
    };
  });
  return { passed: checked.every((r) => r.passed), runs: checked };
}
