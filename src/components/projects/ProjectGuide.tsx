"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckFeedback } from "./CheckFeedback";
import type { CheckResult } from "@/lib/projects/check";
import { useT } from "@/lib/i18n/client";

/** A step as the student's page gets it — never with its hidden checks. */
export type PlayerStep = {
  id: string;
  stage: string;
  title: string;
  instruction: string;
  example: { input: string; expectedOutput: string };
  /** From a nudge to nearly the answer, shown one at a time. */
  hints: string[];
  /** The lesson that teaches the step's idea. */
  lessonHref: string | null;
};

export type Notice = { tone: "ok" | "info" | "error"; text: string } | null;

const proseCls =
  "prose prose-sm prose-zinc max-w-none text-zinc-700 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:text-[0.8em] prose-code:before:content-none prose-code:after:content-none";

/**
 * The guide beside the editor: the project's stages, the step in progress
 * with its example, hints and Cek button, and the steps already done — which
 * open again to be reread, since a later step often builds on an earlier one.
 */
export function ProjectGuide({
  steps,
  passedIds,
  complete,
  preview,
  notice,
  checking,
  checkResult,
  onCheck,
  onUseInput,
}: {
  steps: PlayerStep[];
  passedIds: string[];
  complete: boolean;
  preview: boolean;
  notice: Notice;
  checking: boolean;
  checkResult: CheckResult | null;
  onCheck: () => void;
  onUseInput: (input: string) => void;
}) {
  const t = useT();
  const [openDoneId, setOpenDoneId] = useState<string | null>(null);
  const current = steps.find((s) => !passedIds.includes(s.id)) ?? null;
  const doneCount = passedIds.filter((id) => steps.some((s) => s.id === id)).length;

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

  return (
    // Instructions first on a phone, where the two stack; beside the editor from lg up.
    <aside className="order-first flex min-h-0 max-h-[70dvh] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white lg:order-none lg:max-h-none">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">
          {t("project.guide")}
          {preview && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("project.previewBadge")}</span>
          )}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width]"
              style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }}
            />
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
                if (current?.id === step.id) {
                  return (
                    <li key={step.id} className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
                      <CurrentStep
                        // Hints start hidden again on every new step.
                        key={step.id}
                        step={step}
                        checking={checking}
                        checkResult={checkResult}
                        onCheck={onCheck}
                        onUseInput={onUseInput}
                      />
                    </li>
                  );
                }
                if (done) {
                  const open = openDoneId === step.id;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => setOpenDoneId(open ? null : step.id)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-2 rounded text-left text-sm text-zinc-600 hover:text-zinc-900"
                      >
                        <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100 text-[11px] text-green-700">
                          ✓
                        </span>
                        <span className="min-w-0 flex-1 truncate">{step.title}</span>
                        <span aria-hidden className="text-[10px] text-zinc-400">{open ? "▲" : "▼"}</span>
                        <span className="sr-only">{t("project.stepDone")}</span>
                      </button>
                      {open && (
                        <div className="ml-7 mt-1.5 rounded-md bg-zinc-50 p-2.5">
                          <StepBody step={step} />
                        </div>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={step.id} className="flex items-center gap-2 text-sm text-zinc-400">
                    <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-zinc-100 text-[11px]">
                      🔒
                    </span>
                    <span className="min-w-0 truncate">{step.title}</span>
                    <span className="sr-only">{t("project.stepLocked")}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </aside>
  );
}

/** A step's instruction, lesson link and example — the same whether it's current or reread. */
function StepBody({ step, onUseInput }: { step: PlayerStep; onUseInput?: (input: string) => void }) {
  const t = useT();
  return (
    <>
      <div className={proseCls}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.instruction}</ReactMarkdown>
      </div>
      {step.lessonHref && (
        <a
          href={step.lessonHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-blue-700 hover:underline"
        >
          {t("project.readLesson")}
        </a>
      )}
      {step.example.input && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t("project.exampleInput")}</p>
            {onUseInput && (
              <button type="button" onClick={() => onUseInput(step.example.input)} className="text-[11px] font-medium text-blue-700 hover:underline">
                {t("project.useInput")}
              </button>
            )}
          </div>
          <pre className="mt-1 whitespace-pre-wrap rounded bg-white px-2 py-1.5 font-mono text-xs text-zinc-800 ring-1 ring-zinc-200">{step.example.input}</pre>
        </div>
      )}
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t("project.expectedOutput")}</p>
      <pre className="mt-1 overflow-x-auto whitespace-pre rounded bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-100">
        {step.example.expectedOutput || t("project.noOutput")}
      </pre>
    </>
  );
}

function CurrentStep({
  step,
  checking,
  checkResult,
  onCheck,
  onUseInput,
}: {
  step: PlayerStep;
  checking: boolean;
  checkResult: CheckResult | null;
  onCheck: () => void;
  onUseInput: (input: string) => void;
}) {
  const t = useT();
  const [hintsShown, setHintsShown] = useState(0);
  return (
    <>
      <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
      <div className="mt-1">
        <StepBody step={step} onUseInput={onUseInput} />
      </div>

      {step.hints.length > 0 && (
        <div className="mt-2 space-y-1">
          {step.hints.slice(0, hintsShown).map((hint, i) => (
            <p key={i} className="rounded bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
              <span className="font-semibold">{t("project.hintN", { n: i + 1 })}</span> {hint}
            </p>
          ))}
          {hintsShown < step.hints.length && (
            <button type="button" onClick={() => setHintsShown((n) => n + 1)} className="text-xs font-medium text-blue-700 hover:underline">
              {hintsShown === 0 ? t("project.showHint") : t("project.nextHint")}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onCheck}
        disabled={checking}
        className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {checking ? t("project.checking") : t("project.check")}
      </button>

      {checkResult && !checkResult.passed && <CheckFeedback result={checkResult} />}
    </>
  );
}
