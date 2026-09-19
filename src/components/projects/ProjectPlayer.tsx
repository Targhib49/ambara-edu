"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { ProjectEditor } from "./ProjectEditor";
import { ProjectGuide, type Notice, type PlayerStep } from "./ProjectGuide";
import { CheckFeedback, lastLine } from "./CheckFeedback";
import { runProject } from "@/lib/pyodideWorker";
import { checkRuns, type CheckResult } from "@/lib/projects/check";
import { CHECK_FILE, ENTRY_FILE, type ProjectCheck } from "@/lib/projects/schema";
import { getStepChecks, recordProjectCheck, saveProjectFiles } from "@/lib/actions/projects";
import { useT } from "@/lib/i18n/client";

export type { PlayerStep } from "./ProjectGuide";

type RunOutput = { output: string; error: string | null } | null;

/**
 * The tutor's preview: every step's runs and files are on the page, checks
 * run and advance locally, and nothing is saved or recorded.
 */
export type PreviewData = {
  runs: Record<string, ProjectCheck[]>;
  addFiles: Record<string, Record<string, string>>;
  /** The answer key: the whole program once each step is done, to fill in and step through. */
  keys?: Record<string, Record<string, string>>;
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
 * The guided-project screen: two tabs — the guide that walks through the
 * project's steps, and a small IDE (files, tabs, editor) — over a dock that
 * stays put under both: the input box, Run, the output, the current step's
 * target output and a failed check's feedback. Cek in the toolbar runs the
 * program against the step's checks; passing opens the next step, and the
 * files carry over, so the program grows as they go.
 */
export function ProjectPlayer({
  quizId,
  steps,
  initialFiles,
  initialPassedIds,
  initialComplete,
  initialCheckpoint,
  preview,
}: {
  quizId: string;
  steps: PlayerStep[];
  initialFiles: Record<string, string>;
  initialPassedIds: string[];
  initialComplete: boolean;
  /** The files as they were when the current step opened — what "restore" goes back to. */
  initialCheckpoint: Record<string, string>;
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
  const [notice, setNotice] = useState<Notice>(null);
  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [newFileName, setNewFileName] = useState<string | null>(null);
  // Reading the guide or writing code; the input and output stay docked below both.
  const [view, setView] = useState<"guide" | "code">(initialComplete ? "code" : "guide");
  const [dockTab, setDockTab] = useState<"output" | "target" | "result">("output");
  const [dockOpen, setDockOpen] = useState(true);
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
    if (name === CHECK_FILE) return setNotice({ tone: "error", text: t("project.fileReserved", { name }) });
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

  // A broken file goes back to how it was when this step opened; the rest of
  // the student's work is untouched.
  const restoreFile = (name: string) => {
    if (!(name in checkpoint) || !confirm(t("project.restoreConfirm", { name }))) return;
    updateFiles({ ...filesRef.current, [name]: checkpoint[name] });
    setNotice({ tone: "info", text: t("project.restored", { name }) });
  };
  // Preview only: jump to the answer key, so a tutor can walk the whole project quickly.
  const previewKey = preview && current ? preview.keys?.[current.id] : undefined;
  const fillKey = () => {
    if (!previewKey) return;
    updateFiles({ ...previewKey });
    setView("code");
    setNotice({ tone: "info", text: t("projectKey.filled") });
  };

  const canRestore = !complete && activeFile in checkpoint && checkpoint[activeFile] !== files[activeFile];

  // ---- run and check
  const run = async () => {
    if (running) return;
    setRunning(true);
    setDockTab("output");
    setDockOpen(true);
    try {
      const [result] = await runProject(filesRef.current, [{ input: stdin }], ENTRY_FILE);
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
    setCheckResult(null);
    try {
      if (preview) return await checkPreview(current);
      const checks = await getStepChecks(quizId, current.id);
      if ("error" in checks) return setNotice({ tone: "error", text: checks.error });
      const snapshot = filesRef.current;
      const result = await checkRuns(snapshot, checks.runs);
      showResult(result);
      const record = await recordProjectCheck(quizId, current.id, result.passed, snapshot);
      if ("error" in record) return setNotice({ tone: "error", text: record.error });
      // Saved along with the check, so nothing is left to autosave.
      dirtyRef.current = false;
      setSaveState("saved");
      if (!record.passed) return;
      filesRef.current = record.files;
      setFiles(record.files);
      setCheckpoint(record.files);
      setPassedIds(record.passedIds);
      setCheckResult(null);
      setDockTab("output");
      // Back to the guide, where the next step is waiting to be read.
      if (!record.complete) setView("guide");
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

  // A failed check's feedback opens in the dock, under the code being fixed.
  const showResult = (result: CheckResult) => {
    setCheckResult(result);
    if (!result.passed) {
      setDockTab("result");
      setDockOpen(true);
    }
  };

  // The preview's check: the same runs and the same rules, kept in the page.
  const checkPreview = async (step: PlayerStep) => {
    const result = await checkRuns(filesRef.current, preview?.runs[step.id] ?? []);
    showResult(result);
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
    setCheckpoint({ ...filesRef.current });
    setPassedIds(nextPassed);
    setCheckResult(null);
    setDockTab("output");
    if (next) setView("guide");
    setNotice({
      tone: "ok",
      text: !next
        ? t("project.previewFinished")
        : newNames.length
          ? t("project.passedWithFiles", { files: newNames.join(", ") })
          : t("project.passed"),
    });
  };

  const stepNumber = current ? steps.indexOf(current) + 1 : steps.length;
  const doneCount = passedIds.filter((id) => steps.some((s) => s.id === id)).length;
  // The result tab exists only while there's a failed check to show.
  const shownDockTab = dockTab === "result" && !checkResult ? "output" : dockTab === "target" && !current ? "output" : dockTab;

  return (
    <div
      // Ctrl/⌘+Enter runs the program from anywhere in the player — caught
      // before the editor, which would otherwise insert a blank line.
      onKeyDownCapture={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          void run();
        }
      }}
      className="flex h-[calc(100dvh-9rem)] min-h-[540px] flex-col overflow-hidden rounded-xl border border-zinc-300 bg-white"
    >
      {/* ---------------- toolbar ---------------- */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        <div role="tablist" aria-label={t("project.views")} className="flex rounded-lg bg-zinc-200/70 p-0.5">
          <ViewTab active={view === "guide"} onSelect={() => setView("guide")}>
            {t("project.guide")}
            <span className="ml-1.5 text-[11px] tabular-nums text-zinc-500">
              {doneCount}/{steps.length}
            </span>
          </ViewTab>
          <ViewTab active={view === "code"} onSelect={() => setView("code")}>
            {t("project.code")}
          </ViewTab>
        </div>
        <p className="hidden min-w-0 flex-1 truncate text-sm text-zinc-800 md:block">
          {complete ? (
            t("project.allDone")
          ) : current ? (
            <>
              <span className="text-zinc-500">{t("project.stepN", { n: stepNumber, total: steps.length })} · </span>
              {current.title}
            </>
          ) : null}
        </p>
        <span className="ml-auto flex items-center gap-2 md:ml-0">
          {preview && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("project.previewBadge")}</span>
          )}
          <span
            // Tucked away on a phone to keep the toolbar on one line — unless saving failed.
            className={`text-[11px] ${saveState === "error" && !preview ? "text-red-600" : "hidden text-zinc-500 sm:inline"}`}
            aria-live="polite"
          >
            {preview ? t("project.previewNotSaved") : complete ? t("project.readOnly") : t(SAVE_LABEL[saveState])}
          </span>
          {previewKey && (
            <button
              type="button"
              onClick={fillKey}
              title={t("projectKey.fillTitle")}
              className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              {t("projectKey.fill")}
            </button>
          )}
          {!complete && current && (
            <button
              type="button"
              onClick={check}
              disabled={checking}
              title={t("project.checkTitle")}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {checking ? t("project.checking") : t("project.check")}
            </button>
          )}
        </span>
      </div>
      <div className="h-1 shrink-0 bg-zinc-100" aria-hidden>
        <div className="h-full bg-blue-600 transition-[width]" style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }} />
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 px-3 py-2 text-sm ${
            notice.tone === "ok" ? "bg-green-50 text-green-800" : notice.tone === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"
          }`}
        >
          <p className="min-w-0 flex-1">{notice.text}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label={t("project.dismiss")} className="shrink-0 px-1 opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* ---------------- guide / code ----------------
          Both stay mounted, so the editor keeps its undo history and the
          guide its open hints while the other is showing. */}
      <div className="relative min-h-0 flex-1">
        <div role="tabpanel" className={view === "guide" ? "h-full" : "hidden"}>
          <ProjectGuide
            steps={steps}
            passedIds={passedIds}
            complete={complete}
            visible={view === "guide"}
            onUseInput={(input) => {
              setStdin(input);
              setDockOpen(true);
            }}
            onOpenCode={() => setView("code")}
          />
        </div>

        <div role="tabpanel" className={view === "code" ? "flex h-full" : "hidden"}>
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
              {canRestore && (
                <button
                  type="button"
                  onClick={() => restoreFile(activeFile)}
                  title={t("project.restoreTitle")}
                  className="shrink-0 px-3 text-[11px] font-medium text-blue-700 hover:underline"
                >
                  {t("project.restore")}
                </button>
              )}
            </div>
            <div className="min-h-0 flex-1">
              <ProjectEditor fileName={activeFile} text={files[activeFile] ?? ""} readOnly={complete} onChange={onEdit} />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- dock: input, run, output ---------------- */}
      <div className={`flex shrink-0 flex-col border-t border-zinc-300 ${dockOpen ? "h-52 sm:h-48" : ""}`}>
        <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-1.5 py-1">
          <div role="tablist" aria-label={t("project.dock")} className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
            <DockTab active={dockOpen && shownDockTab === "output"} onSelect={() => { setDockTab("output"); setDockOpen(true); }}>
              {t("project.output")}
            </DockTab>
            {current && (
              <DockTab active={dockOpen && shownDockTab === "target"} onSelect={() => { setDockTab("target"); setDockOpen(true); }}>
                {t("project.dockTarget")}
              </DockTab>
            )}
            {checkResult && !checkResult.passed && (
              <DockTab active={dockOpen && shownDockTab === "result"} onSelect={() => { setDockTab("result"); setDockOpen(true); }}>
                <span aria-hidden className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle" />
                {t("project.dockResult")}
              </DockTab>
            )}
          </div>
          <button
            type="button"
            onClick={run}
            disabled={running}
            title={t("project.runShortcut")}
            className="shrink-0 rounded-md bg-zinc-800 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {running ? t("project.running") : t("project.run")}
          </button>
          <button
            type="button"
            onClick={() => setDockOpen((open) => !open)}
            aria-expanded={dockOpen}
            aria-label={dockOpen ? t("project.collapseDock") : t("project.expandDock")}
            title={dockOpen ? t("project.collapseDock") : t("project.expandDock")}
            className="shrink-0 rounded px-1.5 py-1 text-xs text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
          >
            {dockOpen ? "▾" : "▴"}
          </button>
        </div>

        {dockOpen && (
          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] sm:grid-cols-[14rem_minmax(0,1fr)] sm:grid-rows-1">
            <div className="flex min-h-0 flex-col gap-1 border-b border-zinc-200 bg-zinc-50 p-2 sm:border-b-0 sm:border-r">
              <label htmlFor="project-stdin" className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                {t("project.input")}
              </label>
              <textarea
                id="project-stdin"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={2}
                placeholder={t("project.inputPlaceholder")}
                className="w-full resize-none rounded border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs focus:border-blue-500 focus:outline-none sm:flex-1"
              />
            </div>

            {shownDockTab === "result" && checkResult ? (
              <div role="tabpanel" className="min-h-0 overflow-auto p-2">
                <CheckFeedback result={checkResult} />
              </div>
            ) : shownDockTab === "target" && current ? (
              <div role="tabpanel" className="min-h-0 overflow-auto bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100">
                {current.example.input && (
                  <p className="mb-1.5 text-zinc-400">
                    {t("project.targetWithInput", { input: current.example.input.split("\n").join(" ⏎ ") })}
                  </p>
                )}
                <pre className="whitespace-pre">{current.example.expectedOutput || t("project.noOutput")}</pre>
              </div>
            ) : (
              <pre role="tabpanel" className="min-h-0 overflow-auto whitespace-pre-wrap bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100">
                {runOutput ? (
                  <>
                    {runOutput.output}
                    {runOutput.error && <span className="text-red-400">{(runOutput.output ? "\n" : "") + lastLine(runOutput.error)}</span>}
                  </>
                ) : (
                  <span className="text-zinc-500">{t("project.outputEmpty")}</span>
                )}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewTab({ active, onSelect, children }: { active: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`rounded-md px-3 py-1 text-sm font-medium ${active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
    >
      {children}
    </button>
  );
}

function DockTab({ active, onSelect, children }: { active: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        active ? "bg-white text-zinc-900 ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {children}
    </button>
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
