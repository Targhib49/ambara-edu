"use client";

// Client-side test-case runner for CODE quiz questions (spec §5 v2): executes
// the student's program once per test case in the shared Pyodide runtime,
// feeding the case's input as stdin and comparing captured stdout against the
// expected output.

import { getPyodide, type Pyodide } from "@/lib/pyodide";
import type { TestCase, TestResult } from "@/lib/quiz/schema";

/**
 * Whitespace-tolerant output comparison (classic judge rules): trailing
 * whitespace on each line and trailing newlines are ignored; everything else
 * must match exactly.
 */
function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

async function runSingleCase(pyodide: Pyodide, code: string, testCase: TestCase): Promise<TestResult> {
  const outputs: string[] = [];
  pyodide.setStdout({ batched: (text) => outputs.push(text) });
  pyodide.setStderr({ batched: (text) => outputs.push(text) });

  // Hand the whole input to the first stdin read; after that it's EOF, which
  // matches real Python behavior when input() runs past the provided lines.
  let remaining: string | null = testCase.input;
  pyodide.setStdin({
    stdin: () => {
      const chunk = remaining;
      remaining = null;
      return chunk;
    },
  });

  // Fresh globals per case so one run's variables can't leak into the next.
  const globals = (await pyodide.runPythonAsync("dict()")) as { destroy?: () => void };
  try {
    const result = (await pyodide.runPythonAsync(code, { globals })) as
      | { destroy?: () => void }
      | undefined;
    if (result && typeof result === "object") result.destroy?.();
  } catch (err) {
    outputs.push(err instanceof Error ? err.message : String(err));
    return { passed: false, actualOutput: outputs.join("").slice(0, 4000) };
  } finally {
    globals.destroy?.();
  }

  const actualOutput = outputs.join("").slice(0, 4000);
  return {
    passed: normalizeOutput(actualOutput) === normalizeOutput(testCase.expectedOutput),
    actualOutput,
  };
}

// The Pyodide instance is a shared singleton with global stdio hooks, so runs
// from different questions must not interleave — chain them through a queue.
let queue: Promise<unknown> = Promise.resolve();

export function runTestCases(code: string, testCases: TestCase[]): Promise<TestResult[]> {
  const run = queue.then(async () => {
    const pyodide = await getPyodide();
    await pyodide.loadPackagesFromImports(code);
    const results: TestResult[] = [];
    for (const testCase of testCases) {
      results.push(await runSingleCase(pyodide, code, testCase));
    }
    return results;
  });
  queue = run.catch(() => {}); // a failed run must not poison the queue
  return run;
}
