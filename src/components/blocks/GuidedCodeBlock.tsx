"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { useT } from "@/lib/i18n/client";
import { failedCodeChecks, type GuidedCode } from "@/lib/blocks/guided";
import { saveGuidedCode } from "@/lib/actions/guided";
import { ExampleDiff } from "@/components/projects/CheckFeedback";
import { normalizeOutput } from "./CppEditorBlock";
import type { CppRunResult } from "@/app/api/run/cpp/route";

export type GuidedProgress = { code: string; stepStartCode: string; passedSteps: number };

type Panel =
  | { kind: "run"; result: CppRunResult }
  | { kind: "failed"; reason: "cooldown" | "unavailable" }
  | { kind: "checkFailed"; result: CppRunResult; outputOk: boolean; codeProblems: string[]; stdin: string; expected: string }
  | { kind: "passed" };

type SaveState = "saved" | "dirty" | "saving" | "error";

const proseCls =
  "prose prose-sm prose-zinc max-w-none text-zinc-700 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:text-[0.8em] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 prose-pre:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100";

const btn = "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50";

const AUTOSAVE_MS = 2500;

/**
 * A guided exercise in a lesson: the steps above, one C++ file below. "Check
 * step" compiles and runs the program on the server (/api/run/cpp), compares
 * what it prints with the step's target and, if the step says so, looks for
 * what the code must contain. Passing opens the next step with the code as it
 * is — the program grows step by step.
 *
 * Students' code and place are saved (debounced, and on every pass); a tutor's
 * preview behaves the same but saves nothing.
 */
export function GuidedCodeBlock({
  blockId,
  data,
  initial,
  preview,
}: {
  blockId: string;
  data: GuidedCode;
  initial: GuidedProgress | null;
  preview: boolean;
}) {
  const t = useT();
  const total = data.steps.length;
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  const [passed, setPassed] = useState(Math.min(initial?.passedSteps ?? 0, total));
  const [stepStartCode, setStepStartCode] = useState(initial?.stepStartCode ?? data.starterCode);
  const [openDone, setOpenDone] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [stdin, setStdin] = useState(data.steps[Math.min(passed, total - 1)].stdin);
  const [showInput, setShowInput] = useState(false);
  const [busy, setBusy] = useState<"run" | "check" | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const finished = passed >= total;
  const current = finished ? null : data.steps[passed];

  // Saves run one after another, so a slow autosave can't land after (and undo) a pass.
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const passedRef = useRef(passed);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function save(passedSteps: number) {
    if (preview) return Promise.resolve();
    if (timer.current) clearTimeout(timer.current);
    const code = viewRef.current?.state.doc.toString() ?? "";
    setSaveState("saving");
    saveChain.current = saveChain.current.then(() =>
      saveGuidedCode(blockId, { code, passedSteps }).then(
        () => setSaveState("saved"),
        () => setSaveState("error")
      )
    );
    return saveChain.current;
  }
  const saveRef = useRef(save);
  // The editor's listener is set up once; these keep it pointed at the latest state.
  useEffect(() => {
    passedRef.current = passed;
    saveRef.current = save;
  });

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: initial?.code ?? data.starterCode,
      extensions: [
        basicSetup,
        cpp(),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged || preview) return;
          setSaveState("dirty");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => saveRef.current(passedRef.current), AUTOSAVE_MS);
        }),
      ],
      parent: hostRef.current,
    });
    viewRef.current = view;
    return () => {
      if (timer.current) clearTimeout(timer.current);
      view.destroy();
    };
    // Mounts once: a re-render must not wipe what the student typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaving with unsaved code: try once more on the way out.
  useEffect(() => {
    const flush = () => {
      if (timer.current) saveRef.current(passedRef.current);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  async function compileAndRun(input: string): Promise<CppRunResult | Panel> {
    try {
      const response = await fetch("/api/run/cpp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: viewRef.current?.state.doc.toString() ?? "", stdin: input }),
      });
      if (response.ok) return (await response.json()) as CppRunResult;
      return { kind: "failed", reason: response.status === 429 ? "cooldown" : "unavailable" };
    } catch {
      return { kind: "failed", reason: "unavailable" };
    }
  }

  async function run() {
    if (busy) return;
    setBusy("run");
    const result = await compileAndRun(stdin);
    setPanel("kind" in result ? result : { kind: "run", result });
    setBusy(null);
  }

  async function check() {
    if (busy || !current) return;
    setBusy("check");
    const result = await compileAndRun(current.stdin);
    setBusy(null);
    if ("kind" in result) return setPanel(result);

    const outputOk = result.compiled && !result.signal && normalizeOutput(result.stdout) === normalizeOutput(current.expectedOutput);
    const codeProblems = result.compiled ? failedCodeChecks(viewRef.current?.state.doc.toString() ?? "", current.codeChecks) : [];
    if (!outputOk || codeProblems.length) {
      setPanel({ kind: "checkFailed", result, outputOk, codeProblems, stdin: current.stdin, expected: current.expectedOutput });
      return;
    }

    const next = passed + 1;
    setPassed(next);
    setStepStartCode(viewRef.current?.state.doc.toString() ?? "");
    setHintsShown(0);
    setOpenDone(null);
    if (next < total) setStdin(data.steps[next].stdin);
    setPanel(next < total ? { kind: "passed" } : null);
    save(next);
    requestAnimationFrame(() => stepsRef.current?.querySelector("[data-current]")?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  function restore() {
    const view = viewRef.current;
    if (!view || !window.confirm(t("guided.restoreConfirm"))) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: stepStartCode } });
    setPanel(null);
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          run();
        }
      }}
    >
      {/* Header: what this is and how far along. */}
      <div className="space-y-2 border-b border-blue-100 bg-blue-50/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">{t("guided.badge")}</span>
          <span className="ml-auto text-xs tabular-nums text-zinc-500">{t("guided.progress", { n: passed, total })}</span>
        </div>
        <h3 className="text-base font-semibold text-zinc-900">{data.title}</h3>
        <div className="flex gap-1" aria-hidden>
          {data.steps.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < passed ? "bg-emerald-500" : i === passed ? "bg-blue-500" : "bg-zinc-200"}`} />
          ))}
        </div>
      </div>

      {data.intro && (
        <div className={`border-b border-zinc-100 px-4 py-3 ${proseCls}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.intro}</ReactMarkdown>
        </div>
      )}

      {/* The steps: done ones reopen to reread, the current one is open, later ones show their titles. */}
      <ol ref={stepsRef} className="max-h-[32rem] divide-y divide-zinc-100 overflow-y-auto">
        {data.steps.map((step, i) => {
          const done = i < passed;
          const isCurrent = i === passed;
          const open = isCurrent || openDone === i;
          return (
            <li key={i} data-current={isCurrent || undefined} className={isCurrent ? "bg-white" : "bg-zinc-50/50"}>
              <button
                type="button"
                disabled={!done}
                onClick={() => setOpenDone(openDone === i ? null : i)}
                aria-expanded={done ? open : undefined}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left disabled:cursor-default"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    done ? "bg-emerald-500 text-white" : isCurrent ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`min-w-0 flex-1 text-sm ${isCurrent ? "font-semibold text-zinc-900" : done ? "text-zinc-700" : "text-zinc-400"}`}>
                  {step.title}
                </span>
                {done && <span className="text-xs text-zinc-400">{open ? "▴" : "▾"}</span>}
              </button>
              {open && (
                <div className="space-y-3 px-4 pb-4 pl-11">
                  <div className={proseCls}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.instructions}</ReactMarkdown>
                  </div>
                  {step.stdin && (
                    <p className="text-xs text-zinc-500">
                      {t("guided.useInput", { input: step.stdin.trim().split("\n").join(" ⏎ ") })}
                    </p>
                  )}
                  <div>
                    <p className="text-xs font-medium text-zinc-500">{t("cpp.expected")}</p>
                    <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
                      {step.expectedOutput || t("project.noOutput")}
                    </pre>
                  </div>
                  {isCurrent && step.hints.length > 0 && (
                    <div className="space-y-1.5">
                      {step.hints.slice(0, hintsShown).map((hint, h) => (
                        <div key={h} className={`rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 ${proseCls} prose-p:my-0`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{`**${t("project.hintN", { n: h + 1 })}** ${hint}`}</ReactMarkdown>
                        </div>
                      ))}
                      {hintsShown < step.hints.length && (
                        <button type="button" onClick={() => setHintsShown(hintsShown + 1)} className="text-xs font-medium text-amber-700 hover:underline">
                          💡 {hintsShown === 0 ? t("guided.showHint") : t("project.nextHint")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {finished && (
        <p role="status" className="border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {t("guided.finished", { total })}
        </p>
      )}

      {/* The one file. */}
      <div className="border-t border-zinc-200">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500">
          <span className="font-mono text-zinc-700">main.cpp</span>
          <span className="ml-auto">
            {preview ? t("guided.previewNote") : t(`project.save.${saveState}`)}
          </span>
        </div>
        <div ref={hostRef} className="max-h-[32rem] overflow-auto text-sm [&_.cm-editor]:outline-none" />
      </div>

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
        {!finished && (
          <button
            onClick={check}
            disabled={busy !== null}
            title={t("guided.checkTitle")}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {busy === "check" ? t("project.checking") : t("guided.check")}
          </button>
        )}
        <button onClick={run} disabled={busy !== null} title={t("guided.runShortcut")} className={btn}>
          {busy === "run" ? t("cpp.compiling") : t("project.run")}
        </button>
        <button onClick={restore} disabled={busy !== null} title={t("guided.restoreTitle")} className={btn}>
          {t("project.restore")}
        </button>
        <button onClick={() => setShowInput((v) => !v)} aria-expanded={showInput} className={btn}>
          {t("cpp.inputToggle")}
        </button>
        <span className="ml-auto text-xs text-zinc-400">{t("cpp.runsOnServer")}</span>
      </div>

      {panel && <ResultPanel panel={panel} />}
    </div>
  );
}

function ResultPanel({ panel }: { panel: Panel }) {
  const t = useT();
  if (panel.kind === "failed") {
    return (
      <p role="alert" className="border-t border-zinc-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        {t(panel.reason === "cooldown" ? "cpp.cooldown" : "cpp.unavailable")}
      </p>
    );
  }
  if (panel.kind === "passed") {
    return (
      <p role="status" className="border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
        {t("project.passed")}
      </p>
    );
  }
  if (panel.kind === "run") return <RunOutput result={panel.result} />;

  // A failed check: say why, most useful first.
  const { result } = panel;
  return (
    <div role="alert" className="border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
      <p className="font-semibold">{t("project.checkFailed")}</p>
      <div className="mt-2">
        {!result.compiled ? (
          <p>{t("guided.notCompiled")}</p>
        ) : result.signal ? (
          <p>{t("guided.crashed", { signal: result.signal })}</p>
        ) : !panel.outputOk ? (
          <ExampleDiff
            run={{ kind: "example", label: "", input: panel.stdin, expectedOutput: panel.expected, output: result.stdout, error: null, passed: false }}
          />
        ) : (
          <>
            <p>{t("guided.notPassedCode")}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {panel.codeProblems.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      {(!result.compiled || result.signal) && (
        <div className="-mx-4 -mb-3 mt-3">
          <RunOutput result={result} />
        </div>
      )}
    </div>
  );
}

function RunOutput({ result }: { result: CppRunResult }) {
  const t = useT();
  return (
    <pre className="max-h-72 overflow-auto border-t border-zinc-200 bg-zinc-900 px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap">
      {!result.compiled ? (
        <>
          <span className="font-semibold text-red-300">
            {t("cpp.compileError")}
            {"\n"}
          </span>
          <span className="text-red-400">{result.compileOutput}</span>
        </>
      ) : (
        <>
          {result.stdout === "" && result.stderr === "" && <span className="italic text-zinc-500">{t("code.noOutput")}</span>}
          <span className="text-zinc-100">{result.stdout}</span>
          {result.stderr && <span className="text-red-400">{result.stderr}</span>}
          {result.signal && (
            <span className="text-red-400">
              {"\n"}
              {t("cpp.crashed", { signal: result.signal })}
            </span>
          )}
          {result.compileOutput && (
            <span className="text-amber-300">
              {"\n"}
              {result.compileOutput}
            </span>
          )}
        </>
      )}
    </pre>
  );
}
