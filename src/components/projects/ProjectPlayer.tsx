"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectEditor } from "./ProjectEditor";
import { runProject } from "@/lib/pyodideWorker";
import { checkRuns, type CheckResult } from "@/lib/projects/check";
import { ENTRY_FILE, type ProjectRun } from "@/lib/projects/schema";
import { getStepChecks, recordProjectCheck, saveProjectFiles } from "@/lib/actions/projects";
import { useT } from "@/lib/i18n/client";

/** A step as the student's page gets it — never with its hidden tests. */
export type PlayerStep = {
  id: string;
  stage: string;
  title: string;
  instruction: string;
  example: { input: string; expectedOutput: string };
  hint: string;
};

type RunOutput = { output: string; error: string | null } | null;

/**
 * The tutor's preview: every step's runs and files are on the page, checks
 * run and advance locally, and nothing is saved or recorded.
 */
export type PreviewData = {
  runs: Record<string, ProjectRun[]>;
  addFiles: Record<string, Record<string, string>>;
};

const SAVE_LABEL = {
  saved: "project.save.saved",
  dirty: "project.save.dirty",
  saving: "project.save.saving",
  error: "project.save.error",
} as const;

const FILE_NAME = /^(?!\/)(?!.*\.\.)[A-Za-z0-9_\-./]+\.(py|txt|csv|json|md)$/;
const AUTOSAVE_MS = 1200;

/**
 * The guided-project screen: a small IDE (files, tabs, an input box, Run and
 * an output panel) beside a guide that walks through the project's steps. A
 * step's Cek button runs the program against the step's checks; passing opens
 * the next step, and the files carry over, so the program grows as they go.
 */
export function ProjectPlayer({
  quizId,
  steps,
  initialFiles,
  initialPassedIds,
  initialComplete,
  preview,
}: {
  quizId: string;
  steps: PlayerStep[];
  initialFiles: Record<string, string>;
  initialPassedIds: string[];
  initialComplete: boolean;
  preview?: PreviewData;
}) {
  const t = useT();
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState(ENTRY_FILE);
  const [openTabs, setOpenTabs] = useState<string[]>([ENTRY_FILE]);
  const [passedIds, setPassedIds] = useState(initialPassedIds);
  const [complete, setComplete] = useState(initialComplete);
  const [stdin, setStdin] = useState("");
  const [runOutput, setRunOutput] = useState<RunOutput>(null);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "info" | "error"; text: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [newFileName, setNewFileName] = useState<string | null>(null);
  const [, startSave] = useTransition();

  const current = useMemo(() => steps.find((s) => !passedIds.includes(s.id)) ?? null, [steps, passedIds]);

  // ---- autosave: a short pause after the last edit, and before leaving.
  const filesRef = useRef(files);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = useCallback(() => {
    if (!dirtyRef.current || complete || preview) return;
    dirtyRef.current = false;
    setSaveState("saving");
    const snapshot = filesRef.current;
    startSave(async () => {
      const result = await saveProjectFiles(quizId, snapshot);
      setSaveState("error" in result ? "error" : dirtyRef.current ? "dirty" : "saved");
    });
  }, [complete, quizId, preview]);

  const updateFiles = useCallback(
    (next: Record<string, string>) => {
      filesRef.current = next;
      setFiles(next);
      dirtyRef.current = true;
      setSaveState("dirty");
      setCheckResult(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, AUTOSAVE_MS);
    },
    [flush]
  );

  useEffect(() => {
    const onLeave = () => flush();
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flush]);

  const onEdit = useCallback(
    (name: string, text: string) => {
      if (filesRef.current[name] === text) return;
      updateFiles({ ...filesRef.current, [name]: text });
    },
    [updateFiles]
  );

  // ---- files
  const fileNames = Object.keys(files).sort((a, b) => (a === ENTRY_FILE ? -1 : b === ENTRY_FILE ? 1 : a.localeCompare(b)));
  const openFile = (name: string) => {
    setActiveFile(name);
    setOpenTabs((tabs) => (tabs.includes(name) ? tabs : [...tabs, name]));
  };
  const closeTab = (name: string) => {
    setOpenTabs((tabs) => {
      const next = tabs.filter((n) => n !== name);
      if (activeFile === name) setActiveFile(next[next.length - 1] ?? ENTRY_FILE);
      return next.length ? next : [ENTRY_FILE];
    });
  };
  const createFile = () => {
    const name = (newFileName ?? "").trim();
    if (!FILE_NAME.test(name)) return setNotice({ tone: "error", text: t("project.fileNameRule") });
    if (name in files) return setNotice({ tone: "error", text: t("project.fileExists", { name }) });
    updateFiles({ ...filesRef.current, [name]: "" });
    setNewFileName(null);
    setNotice(null);
    openFile(name);
  };
  const deleteFile = (name: string) => {
    if (name === ENTRY_FILE || !confirm(t("project.deleteFileConfirm", { name }))) return;
    const next = { ...filesRef.current };
    delete next[name];
    updateFiles(next);
    closeTab(name);
  };

  // ---- run and check
  const run = async () => {
    if (running) return;
    setRunning(true);
    try {
      const [result] = await runProject(filesRef.current, [stdin], ENTRY_FILE);
      setRunOutput(result);
    } catch (err) {
      setRunOutput({ output: "", error: err instanceof Error ? err.message : String(err) });
    } finally {
      setRunning(false);
    }
  };

  const check = async () => {
    if (!current || checking || complete) return;
    setChecking(true);
    setNotice(null);
    try {
      if (preview) return await checkPreview(current);
      const checks = await getStepChecks(quizId, current.id);
      if ("error" in checks) return setNotice({ tone: "error", text: checks.error });
      const snapshot = filesRef.current;
      const result = await checkRuns(snapshot, checks.runs);
      setCheckResult(result);
      const record = await recordProjectCheck(quizId, current.id, result.passed, snapshot);
      if ("error" in record) return setNotice({ tone: "error", text: record.error });
      // Saved along with the check, so nothing is left to autosave.
      dirtyRef.current = false;
      setSaveState("saved");
      if (!record.passed) return;
      filesRef.current = record.files;
      setFiles(record.files);
      setPassedIds(record.passedIds);
      setShowHint(false);
      setCheckResult(null);
      if (record.complete) {
        setComplete(true);
        setNotice({ tone: "ok", text: t("project.finished") });
      } else {
        setNotice({
          tone: "ok",
          text: record.addedFiles.length
            ? t("project.passedWithFiles", { files: record.addedFiles.join(", ") })
            : t("project.passed"),
        });
        if (record.addedFiles[0]) openFile(record.addedFiles[0]);
      }
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setChecking(false);
    }
  };

  // The preview's check: the same runs and the same rules, kept in the page.
  const checkPreview = async (step: PlayerStep) => {
    const result = await checkRuns(filesRef.current, preview?.runs[step.id] ?? []);
    setCheckResult(result);
    if (!result.passed) return;
    const nextPassed = [...passedIds, step.id];
    const next = steps.find((s) => !nextPassed.includes(s.id)) ?? null;
    const added = next ? preview?.addFiles[next.id] ?? {} : {};
    const newNames = Object.keys(added).filter((name) => !(name in filesRef.current));
    if (newNames.length) {
      const merged = { ...filesRef.current };
      for (const name of newNames) merged[name] = added[name];
      filesRef.current = merged;
      setFiles(merged);
      openFile(newNames[0]);
    }
    setPassedIds(nextPassed);
    setCheckResult(null);
    setShowHint(false);
    setNotice({
      tone: "ok",
      text: !next
        ? t("project.previewFinished")
        : newNames.length
          ? t("project.passedWithFiles", { files: newNames.join(", ") })
          : t("project.passed"),
    });
  };

  // Steps grouped by stage, in order — a stage is a run of steps sharing one.
  const stages = useMemo(() => {
    const groups: { stage: string; steps: PlayerStep[] }[] = [];
    for (const step of steps) {
      const last = groups[groups.length - 1];
      if (last && last.stage === step.stage) last.steps.push(step);
      else groups.push({ stage: step.stage, steps: [step] });
    }
    return groups;
  }, [steps]);
  const doneCount = passedIds.filter((id) => steps.some((s) => s.id === id)).length;

  return (
    <div className="grid gap-3 lg:h-[calc(100dvh-9rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ---------------- IDE ---------------- */}
      <div className="flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-300 bg-white lg:min-h-0">
        <div className="flex min-h-0 flex-1">
          {/* file list */}
          <aside className="hidden w-44 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 sm:flex">
            <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <span>{t("project.files")}</span>
              {!complete && (
                <button
                  type="button"
                  onClick={() => setNewFileName(newFileName === null ? "" : null)}
                  aria-label={t("project.newFile")}
                  title={t("project.newFile")}
                  className="rounded px-1 text-base leading-none text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                >
                  +
                </button>
              )}
            </div>
            {newFileName !== null && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createFile();
                }}
                className="px-2 pb-2"
              >
                <input
                  autoFocus
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setNewFileName(null)}
                  placeholder="nama_file.py"
                  aria-label={t("project.newFile")}
                  className="w-full rounded border border-zinc-300 px-2 py-1 font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </form>
            )}
            <ul className="min-h-0 flex-1 overflow-y-auto pb-2">
              {fileNames.map((name) => (
                <li key={name} className="group flex items-center">
                  <button
                    type="button"
                    onClick={() => openFile(name)}
                    className={`min-w-0 flex-1 truncate px-3 py-1.5 text-left font-mono text-xs ${
                      name === activeFile ? "bg-blue-100 text-blue-800" : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {name}
                  </button>
                  {!complete && name !== ENTRY_FILE && (
                    <button
                      type="button"
                      onClick={() => deleteFile(name)}
                      aria-label={t("project.deleteFile", { name })}
                      className="px-2 text-xs text-zinc-400 opacity-0 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* tabs + editor */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50">
              {/* On a phone there's no file list, so the tabs list every file; from
                  sm up they're the open tabs. Both are rendered and CSS picks one —
                  reading the window size here would differ between server and client. */}
              <div className="flex min-w-0 flex-1 overflow-x-auto sm:hidden">
                {fileNames.map((name) => (
                  <Tab key={name} name={name} active={name === activeFile} onOpen={openFile} />
                ))}
              </div>
              <div className="hidden min-w-0 flex-1 overflow-x-auto sm:flex">
                {openTabs
                  .filter((name) => name in files)
                  .map((name) => (
                    <Tab
                      key={name}
                      name={name}
                      active={name === activeFile}
                      onOpen={openFile}
                      onClose={openTabs.length > 1 ? closeTab : undefined}
                      closeLabel={t("project.closeTab", { name })}
                    />
                  ))}
              </div>
              <span className="shrink-0 px-3 text-[11px] text-zinc-400" aria-live="polite">
                {preview ? t("project.previewNotSaved") : complete ? t("project.readOnly") : t(SAVE_LABEL[saveState])}
              </span>
            </div>
            <div className="min-h-[260px] flex-1 lg:min-h-0">
              <ProjectEditor fileName={activeFile} text={files[activeFile] ?? ""} readOnly={complete} onChange={onEdit} />
            </div>
          </div>
        </div>

        {/* input + run + output */}
        <div className="grid border-t border-zinc-200 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2 border-b border-zinc-200 bg-zinc-50 p-3 sm:border-b-0 sm:border-r">
            <label htmlFor="project-stdin" className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {t("project.input")}
            </label>
            <textarea
              id="project-stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              placeholder={t("project.inputPlaceholder")}
              className="w-full resize-none rounded border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {running ? t("project.running") : t("project.run")}
            </button>
          </div>
          <div className="flex min-h-[8rem] flex-col bg-zinc-900 lg:max-h-48">
            <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{t("project.output")}</p>
            <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs text-zinc-100">
              {runOutput ? (
                <>
                  {runOutput.output}
                  {runOutput.error && <span className="text-red-400">{(runOutput.output ? "\n" : "") + lastLine(runOutput.error)}</span>}
                </>
              ) : (
                <span className="text-zinc-500">{t("project.outputEmpty")}</span>
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* ---------------- guide ---------------- */}
      {/* Instructions first on a phone, where the two stack; beside the editor from lg up. */}
      <aside className="order-first flex min-h-0 max-h-[70dvh] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white lg:order-none lg:max-h-none">
        <div className="border-b border-zinc-100 px-4 py-3">
          <p className="text-sm font-semibold text-zinc-900">
            {t("project.guide")}
            {preview && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("project.previewBadge")}</span>}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }} />
            </div>
            <span className="shrink-0 text-xs tabular-nums text-zinc-500">
              {doneCount} / {steps.length}
            </span>
          </div>
        </div>

        {notice && (
          <p
            className={`mx-4 mt-3 rounded-md px-3 py-2 text-sm ${
              notice.tone === "ok" ? "bg-green-50 text-green-800" : notice.tone === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"
            }`}
          >
            {notice.text}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {complete && <p className="mb-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">{t("project.completeBody")}</p>}
          {stages.map((group) => (
            <section key={group.stage} className="mb-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{group.stage}</p>
              <ol className="space-y-1.5">
                {group.steps.map((step) => {
                  const done = passedIds.includes(step.id);
                  const isCurrent = current?.id === step.id;
                  if (!isCurrent) {
                    return (
                      <li key={step.id} className={`flex items-center gap-2 text-sm ${done ? "text-zinc-600" : "text-zinc-400"}`}>
                        <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${done ? "bg-green-100 text-green-700" : "bg-zinc-100"}`}>
                          {done ? "✓" : "🔒"}
                        </span>
                        <span className="min-w-0 truncate">{step.title}</span>
                        <span className="sr-only">{done ? t("project.stepDone") : t("project.stepLocked")}</span>
                      </li>
                    );
                  }
                  return (
                    <li key={step.id} className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
                      <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
                      <div className="prose prose-sm prose-zinc mt-1 max-w-none text-zinc-700 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:text-[0.8em] prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.instruction}</ReactMarkdown>
                      </div>

                      {step.example.input && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t("project.exampleInput")}</p>
                            <button type="button" onClick={() => setStdin(step.example.input)} className="text-[11px] font-medium text-blue-700 hover:underline">
                              {t("project.useInput")}
                            </button>
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap rounded bg-white px-2 py-1.5 font-mono text-xs text-zinc-800 ring-1 ring-zinc-200">{step.example.input}</pre>
                        </div>
                      )}
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t("project.expectedOutput")}</p>
                      <pre className="mt-1 whitespace-pre-wrap rounded bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-100">
                        {step.example.expectedOutput || t("project.noOutput")}
                      </pre>

                      {step.hint && (
                        <div className="mt-2">
                          <button type="button" onClick={() => setShowHint((v) => !v)} className="text-xs font-medium text-blue-700 hover:underline">
                            {showHint ? t("project.hideHint") : t("project.showHint")}
                          </button>
                          {showHint && <p className="mt-1 rounded bg-amber-50 px-2 py-1.5 text-xs text-amber-900">{step.hint}</p>}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={check}
                        disabled={checking}
                        className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        {checking ? t("project.checking") : t("project.check")}
                      </button>

                      {checkResult && !checkResult.passed && <CheckFeedback result={checkResult} />}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Tab({
  name,
  active,
  onOpen,
  onClose,
  closeLabel,
}: {
  name: string;
  active: boolean;
  onOpen: (name: string) => void;
  onClose?: (name: string) => void;
  closeLabel?: string;
}) {
  return (
    <div className={`flex shrink-0 items-center border-r border-zinc-200 ${active ? "bg-white text-zinc-900" : "text-zinc-500 hover:bg-zinc-100"}`}>
      <button type="button" onClick={() => onOpen(name)} className="px-3 py-2 font-mono text-xs">
        {name}
      </button>
      {onClose && (
        <button type="button" onClick={() => onClose(name)} aria-label={closeLabel} className="pr-2 text-[11px] text-zinc-400 hover:text-zinc-700">
          ✕
        </button>
      )}
    </div>
  );
}

/** Python's traceback ends with the line that matters, e.g. "NameError: name 'x' is not defined". */
function lastLine(error: string): string {
  const lines = error.trim().split("\n").filter(Boolean);
  return lines[lines.length - 1] ?? error;
}

/**
 * Why a check failed. The example shows what was expected; a hidden test
 * shows its input and what the program printed, but not the answer — enough
 * to find the bug, not enough to copy.
 */
function CheckFeedback({ result }: { result: CheckResult }) {
  const t = useT();
  const example = result.runs[0];
  const hiddenFailed = result.runs.slice(1).filter((r) => !r.passed);
  return (
    <div className="mt-3 space-y-2 rounded-md bg-red-50 p-2.5 text-xs text-red-800">
      <p className="font-semibold">{t("project.checkFailed")}</p>
      {!example.passed && (
        <div>
          <p>{example.error ? t("project.exampleError") : t("project.exampleMismatch")}</p>
          <pre className="mt-1 whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
            {example.error ? lastLine(example.error) : example.output || t("project.noOutput")}
          </pre>
        </div>
      )}
      {example.passed && hiddenFailed.length > 0 && (
        <div>
          <p>{t("project.hiddenFailed", { n: hiddenFailed.length })}</p>
          <p className="mt-1 text-red-700">{t("project.hiddenInput")}</p>
          <pre className="mt-0.5 whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
            {hiddenFailed[0].input || t("project.noInput")}
          </pre>
          <p className="mt-1 text-red-700">{t("project.hiddenGot")}</p>
          <pre className="mt-0.5 whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
            {hiddenFailed[0].error ? lastLine(hiddenFailed[0].error) : hiddenFailed[0].output || t("project.noOutput")}
          </pre>
        </div>
      )}
    </div>
  );
}
