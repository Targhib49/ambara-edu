"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { useT } from "@/lib/i18n/client";
import type { CppRunResult } from "@/app/api/run/cpp/route";

type Outcome =
  | { kind: "result"; result: CppRunResult }
  | { kind: "failed"; reason: "cooldown" | "unavailable" };

/** Output is compared the way a marker reads it: trailing spaces and blank lines at the end don't count. */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");
}

/**
 * C++ editor with a Run button. The program is compiled and run by the server
 * (see /api/run/cpp); nothing is saved or submitted. With `expectedOutput`,
 * each run is checked against it, which turns the block into a small task
 * that marks itself.
 */
export function CppEditorBlock({ starterCode, expectedOutput }: { starterCode: string; expectedOutput?: string }) {
  const t = useT();
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({ doc: starterCode, extensions: [basicSetup, cpp()], parent: hostRef.current });
    viewRef.current = view;
    return () => view.destroy();
    // Mounts once, like the Python scratchpad: a re-render must not wipe what the student typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    const view = viewRef.current;
    if (!view || running) return;
    setRunning(true);
    try {
      const response = await fetch("/api/run/cpp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: view.state.doc.toString(), stdin }),
      });
      if (response.ok) setOutcome({ kind: "result", result: (await response.json()) as CppRunResult });
      else setOutcome({ kind: "failed", reason: response.status === 429 ? "cooldown" : "unavailable" });
    } catch {
      setOutcome({ kind: "failed", reason: "unavailable" });
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: starterCode } });
    setOutcome(null);
  }

  const result = outcome?.kind === "result" ? outcome.result : null;
  const hasTarget = expectedOutput !== undefined && expectedOutput !== "";
  const matches = result !== null && result.compiled && hasTarget && normalizeOutput(result.stdout) === normalizeOutput(expectedOutput!);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300 bg-white">
      <div ref={hostRef} className="max-h-[28rem] overflow-auto text-sm [&_.cm-editor]:outline-none" />

      {showInput && (
        <div className="border-t border-zinc-200 bg-zinc-50 px-3 py-2">
          <label className="block text-xs font-medium text-zinc-600">
            {t("cpp.inputLabel")}
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={2}
              spellCheck={false}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2">
        <button
          onClick={run}
          disabled={running}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {running ? t("cpp.compiling") : t("scratchpad.run")}
        </button>
        <button
          onClick={reset}
          disabled={running}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
        >
          {t("scratchpad.reset")}
        </button>
        <button
          onClick={() => setShowInput((v) => !v)}
          aria-expanded={showInput}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100"
        >
          {t("cpp.inputToggle")}
        </button>
        <span className="ml-auto text-xs text-zinc-400">{t("cpp.runsOnServer")}</span>
      </div>

      {hasTarget && (
        <div className="border-t border-zinc-200 px-4 py-3">
          <p className="text-xs font-medium text-zinc-500">{t("cpp.expected")}</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-zinc-800">{expectedOutput}</pre>
        </div>
      )}

      {outcome?.kind === "failed" && (
        <p role="alert" className="border-t border-zinc-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {t(outcome.reason === "cooldown" ? "cpp.cooldown" : "cpp.unavailable")}
        </p>
      )}

      {result && (
        <>
          <pre className="max-h-72 overflow-auto border-t border-zinc-200 bg-zinc-900 px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap">
            {!result.compiled ? (
              <>
                <span className="font-semibold text-red-300">{t("cpp.compileError")}{"\n"}</span>
                <span className="text-red-400">{result.compileOutput}</span>
              </>
            ) : (
              <>
                {result.stdout === "" && result.stderr === "" && <span className="italic text-zinc-500">{t("code.noOutput")}</span>}
                <span className="text-zinc-100">{result.stdout}</span>
                {result.stderr && <span className="text-red-400">{result.stderr}</span>}
                {result.signal && <span className="text-red-400">{"\n"}{t("cpp.crashed", { signal: result.signal })}</span>}
                {/* Warnings don't stop the program, but a beginner should still see them. */}
                {result.compileOutput && <span className="text-amber-300">{"\n"}{result.compileOutput}</span>}
              </>
            )}
          </pre>
          {hasTarget && result.compiled && (
            <p
              role="status"
              className={`border-t px-4 py-2.5 text-xs font-medium ${
                matches ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {t(matches ? "cpp.match" : "cpp.noMatch")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
