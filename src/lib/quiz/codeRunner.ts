"use client";

// Client-side test-case runner for CODE quiz questions (spec §5 v2). The
// actual execution lives in the Pyodide Web Worker (src/lib/pyodideWorker.ts)
// so runs never block the UI thread and infinite loops get terminated.

import { runTestCases as runInWorker } from "@/lib/pyodideWorker";
import type { TestCase, TestResult } from "@/lib/quiz/schema";

export function runTestCases(code: string, testCases: TestCase[]): Promise<TestResult[]> {
  return runInWorker(code, testCases);
}
