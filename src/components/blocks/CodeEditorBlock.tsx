"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { isPythonReady, runPythonCode } from "@/lib/pyodideWorker";

type OutputLine = { stream: "stdout" | "stderr" | "result"; text: string };
type RunState = "idle" | "booting" | "running";

const RUN_STATE_LABELS: Record<RunState, string> = {
  idle: "Run ▶",
  booting: "Loading Python…",
  running: "Running…",
};

/**
 * Interactive Python scratchpad (Pyodide, fully client-side). The student
 * edits freely and runs as often as they like; nothing is saved or submitted.
 */
export function CodeEditorBlock({ starterCode }: { starterCode: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [output, setOutput] = useState<OutputLine[] | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: starterCode,
      extensions: [basicSetup, python()],
      parent: hostRef.current,
    });
    viewRef.current = view;
    return () => view.destroy();
    // The editor deliberately mounts once; a starterCode edit by the tutor
    // shouldn't clobber a student's in-progress code on re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    const view = viewRef.current;
    if (!view || runState !== "idle") return;
    const code = view.state.doc.toString();
    const lines: OutputLine[] = [];

    try {
      setRunState(isPythonReady() ? "running" : "booting");
      const outcome = await runPythonCode(code);
      setRunState("running");

      for (const line of outcome.lines) lines.push(line);
      if (outcome.error) lines.push({ stream: "stderr", text: outcome.error });
      // REPL-style echo of the final expression's value.
      if (outcome.resultRepr !== null) lines.push({ stream: "result", text: outcome.resultRepr });
    } catch (err) {
      // Worker-level failure (download failed, timeout/infinite loop, crash).
      lines.push({ stream: "stderr", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setRunState("idle");
      setOutput(lines);
    }
  }

  function reset() {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: starterCode } });
    setOutput(null);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300 bg-white">
      <div ref={hostRef} className="max-h-96 overflow-auto text-sm [&_.cm-editor]:outline-none" />
      <div className="flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2">
        <button
          onClick={run}
          disabled={runState !== "idle"}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {RUN_STATE_LABELS[runState]}
        </button>
        <button
          onClick={reset}
          disabled={runState !== "idle"}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
        >
          Reset
        </button>
        <span className="ml-auto text-xs text-zinc-400">
          Python runs in your browser
          {runState === "booting" && " — first load is ~10 MB, then cached"}
        </span>
      </div>
      {output !== null && (
        <pre className="max-h-64 overflow-auto border-t border-zinc-200 bg-zinc-900 px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap">
          {output.length === 0 ? (
            <span className="italic text-zinc-500">(no output)</span>
          ) : (
            output.map((line, i) => (
              <span
                key={i}
                className={
                  line.stream === "stderr"
                    ? "text-red-400"
                    : line.stream === "result"
                      ? "text-sky-300"
                      : "text-zinc-100"
                }
              >
                {line.text}
                {"\n"}
              </span>
            ))
          )}
        </pre>
      )}
    </div>
  );
}
