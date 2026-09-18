"use client";

import { normalizeOutput, outputsMatch, runProject } from "@/lib/pyodideWorker";
import { ENTRY_FILE, type ProjectCheck } from "@/lib/projects/schema";

export type CheckRun = {
  /** The first run is the step's example, which the student sees in full. */
  kind: "example" | "input" | "script";
  label: string;
  input: string;
  expectedOutput: string;
  output: string;
  error: string | null;
  passed: boolean;
};

export type CheckResult = { passed: boolean; runs: CheckRun[] };

/**
 * Checks a step: runs the student's project once per run — the example first,
 * then the hidden checks, each either their program with other input or a
 * check script beside their files — and passes only if every run prints what's
 * expected without an error. Runs in the browser, since the server has no
 * Python; the runs come from the server, for the current step only.
 */
export async function checkRuns(files: Record<string, string>, runs: ProjectCheck[]): Promise<CheckResult> {
  const results = await runProject(
    files,
    runs.map((r) => ({ input: r.input, script: r.script })),
    ENTRY_FILE
  );
  const checked = runs.map((run, i): CheckRun => {
    const { output, error } = results[i];
    return {
      kind: i === 0 ? "example" : run.script ? "script" : "input",
      label: run.label,
      input: run.input,
      expectedOutput: run.expectedOutput,
      output,
      error,
      passed: !error && outputsMatch(output, run.expectedOutput),
    };
  });
  return { passed: checked.every((r) => r.passed), runs: checked };
}

export type DiffLine = { expected: string | null; actual: string | null; same: boolean };

/**
 * Expected and actual output side by side, line by line, under the same rules
 * the check uses — so the line a student has to fix is the first one marked.
 */
export function diffLines(expected: string, actual: string): { lines: DiffLine[]; firstDifference: number } {
  const a = normalizeOutput(expected).split("\n");
  const b = normalizeOutput(actual).split("\n");
  const lines: DiffLine[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const exp = i < a.length ? a[i] : null;
    const act = i < b.length ? b[i] : null;
    lines.push({ expected: exp, actual: act, same: exp === act });
  }
  return { lines, firstDifference: lines.findIndex((l) => !l.same) };
}
