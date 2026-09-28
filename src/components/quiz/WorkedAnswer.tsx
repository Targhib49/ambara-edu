"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useT } from "@/lib/i18n/client";

const fieldCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

/**
 * Answering a competition problem: the working carries the marks, so it gets
 * the room, and the final answer is a single line beneath it. Maths is
 * written between dollars and can be previewed — a student needs to see that
 * their fraction came out the way they meant before they hand it in.
 */
export function WorkedAnswer({
  working,
  finalAnswer,
  wantsFinalAnswer,
  onChange,
}: {
  working: string;
  finalAnswer: string;
  wantsFinalAnswer: boolean;
  onChange: (patch: { working?: string; finalAnswer?: string }) => void;
}) {
  const t = useT();
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-500" htmlFor="worked-working">
            {t("worked.working")}
          </label>
          <button
            type="button"
            onClick={() => setPreview((on) => !on)}
            className="text-xs font-medium text-blue-700 hover:underline"
          >
            {preview ? t("worked.edit") : t("worked.preview")}
          </button>
        </div>
        {preview ? (
          <div className="prose prose-sm prose-zinc min-h-[8rem] max-w-none rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {working || t("worked.workingHint")}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            id="worked-working"
            value={working}
            onChange={(e) => onChange({ working: e.target.value })}
            rows={10}
            className={`${fieldCls} font-mono`}
          />
        )}
        <p className="mt-1 text-xs text-zinc-500">{t("worked.workingHint")}</p>
      </div>

      {wantsFinalAnswer ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium text-zinc-500" htmlFor="worked-final">
            {t("worked.finalAnswer")}
          </label>
          <input
            id="worked-final"
            value={finalAnswer}
            onChange={(e) => onChange({ finalAnswer: e.target.value })}
            className={`${fieldCls} sm:w-48`}
          />
        </div>
      ) : (
        <p className="text-xs text-zinc-500">{t("worked.noFinalAnswer")}</p>
      )}
    </div>
  );
}
