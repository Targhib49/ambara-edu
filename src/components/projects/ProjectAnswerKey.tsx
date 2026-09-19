"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectFilesViewer } from "./ProjectFilesViewer";
import { useT } from "@/lib/i18n/client";

export type AnswerKeyStep = {
  id: string;
  stage: string;
  title: string;
  points: number;
  instruction: string;
  example: { input: string; expectedOutput: string };
  inputTests: number;
  functionChecks: number;
  hints: string[];
  /** The whole program once the step is done, and the files the step touched; null if no key is stored. */
  key: { files: Record<string, string>; changed: string[] } | null;
};

/**
 * The project's steps for the tutor, each opening to what the student is
 * asked, and the answer key: the program as it stands once the step is done,
 * with the files the step changed marked.
 */
export function ProjectAnswerKey({ steps }: { steps: AnswerKeyStep[] }) {
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(null);
  const missing = steps.some((s) => !s.key);

  return (
    <div className="space-y-2">
      {missing && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{t("projectKey.missing")}</p>}
      <ol className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {steps.map((step, i) => {
          const open = openId === step.id;
          const newStage = i === 0 || steps[i - 1].stage !== step.stage;
          return (
            <li key={step.id}>
              {newStage && <p className="bg-zinc-50 px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{step.stage}</p>}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : step.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50"
              >
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-zinc-400">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">{step.title}</span>
                <span className="hidden shrink-0 text-xs text-zinc-500 sm:inline">
                  {t("projectKey.checks", { input: step.inputTests, functions: step.functionChecks })}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-zinc-500">{t("quizTable.pts", { n: step.points })}</span>
                <span aria-hidden className="text-[10px] text-zinc-400">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="space-y-4 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4">
                  <div className="min-w-0 space-y-3">
                    <div className="prose prose-sm prose-zinc max-w-none prose-code:before:content-none prose-code:after:content-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.instruction}</ReactMarkdown>
                    </div>
                    {step.example.input && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t("project.exampleInput")}</p>
                        <pre className="mt-1 whitespace-pre-wrap rounded bg-white px-2 py-1.5 font-mono text-xs ring-1 ring-zinc-200">{step.example.input}</pre>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t("project.expectedOutput")}</p>
                      <pre className="mt-1 overflow-x-auto rounded bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-100">
                        {step.example.expectedOutput || t("project.noOutput")}
                      </pre>
                    </div>
                    {step.hints.length > 0 && (
                      <ol className="list-decimal space-y-1 pl-5 text-xs text-zinc-600">
                        {step.hints.map((hint, n) => (
                          <li key={n}>{hint}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      {t("projectKey.title")}
                      {step.key && step.key.changed.length > 0 && (
                        <span className="ml-2 font-normal normal-case tracking-normal text-zinc-500">
                          {t("projectKey.changed", { files: step.key.changed.join(", ") })}
                        </span>
                      )}
                    </p>
                    {step.key ? (
                      <ProjectFilesViewer key={step.id} files={step.key.files} changed={step.key.changed} />
                    ) : (
                      <p className="text-sm text-zinc-500">{t("projectKey.none")}</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
