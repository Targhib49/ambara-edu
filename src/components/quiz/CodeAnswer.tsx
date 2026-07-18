"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { runTestCases } from "@/lib/quiz/codeRunner";
import type { TestCase, TestResult } from "@/lib/quiz/schema";

type RunState = "idle" | "booting" | "running";

/**
 * Answer editor for CODE quiz questions: CodeMirror + an optional "Run tests"
 * preview of the visible test cases. The results shown here are informational —
 * the graded run happens at submit time in QuizTakeForm, so stale results
 * can never be submitted.
 */
export function CodeAnswer({
  testCases,
  initialCode,
  onCodeChange,
}: {
  testCases: TestCase[];
  /** Restores previously-typed code — needed when this component remounts
   * (e.g. navigating away from and back to the question in a one-at-a-time
   * exam flow), since CodeMirror otherwise always starts blank. */
  initialCode?: string;
  onCodeChange: (code: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [results, setResults] = useState<TestResult[] | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: initialCode ?? "",
      extensions: [
        basicSetup,
        python(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onCodeChange(update.state.doc.toString());
            setResults(null); // edits invalidate the previewed results
          }
        }),
      ],
      parent: hostRef.current,
    });
    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runPreview() {
    const view = viewRef.current;
    if (!view || runState !== "idle") return;
    const code = view.state.doc.toString();
    if (!code.trim()) return;
    try {
      setRunState("booting");
      const testResults = await runTestCases(code, testCases);
      setResults(testResults);
    } catch (err) {
      setResults(
        testCases.map(() => ({
          passed: false,
          actualOutput: err instanceof Error ? err.message : String(err),
        }))
      );
    } finally {
      setRunState("idle");
    }
  }

  const passedCount = results?.filter((r) => r.passed).length ?? 0;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300">
      <div ref={hostRef} className="max-h-72 overflow-auto bg-white text-sm [&_.cm-editor]:outline-none" />
      {testCases.length > 0 && (
        <div className="flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2">
          <button
            type="button"
            onClick={runPreview}
            disabled={runState !== "idle"}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {runState === "idle" ? "Run tests" : "Running…"}
          </button>
          <span className="text-xs text-zinc-500">
            {results
              ? `${passedCount} / ${results.length} test case${results.length === 1 ? "" : "s"} passed`
              : `${testCases.length} test case${testCases.length === 1 ? "" : "s"} — they run again when you submit`}
          </span>
        </div>
      )}
      {results && (
        <div className="divide-y divide-zinc-100 border-t border-zinc-200 bg-white">
          {results.map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2 text-xs">
              <span
                className={`mt-0.5 rounded-full px-2 py-0.5 font-medium ${
                  r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {r.passed ? "✓" : "✗"}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5 font-mono">
                {testCases[i]?.input && (
                  <p className="truncate text-zinc-500">input: {testCases[i].input}</p>
                )}
                <p className="truncate text-zinc-500">expected: {testCases[i]?.expectedOutput}</p>
                <p className={`truncate ${r.passed ? "text-zinc-700" : "text-red-600"}`}>
                  got: {r.actualOutput.trim() || "(no output)"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
