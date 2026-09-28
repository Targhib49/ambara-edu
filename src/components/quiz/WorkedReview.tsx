"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";
import { useT } from "@/lib/i18n/client";

function Maths({ text }: { text: string }) {
  return (
    <div className="prose prose-sm prose-zinc max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Marking a competition answer: the student's working beside the scheme. The
 * tutor ticks what the work earned and the running total is the number to put
 * in the score box — the marks themselves still go through the review form,
 * so there's one place a score is set.
 */
export function WorkedReview({
  correctAnswer,
  response,
  points,
  autoAwarded,
}: {
  correctAnswer: unknown;
  response: unknown;
  points: number;
  autoAwarded: number;
}) {
  const t = useT();
  const scheme = safeAnswer(correctAnswer);
  const given = safeResponse(response);
  const [ticked, setTicked] = useState<Set<number>>(new Set());

  if (!scheme) return null;
  const totalMarks = scheme.answerMarks + scheme.rubric.reduce((sum, item) => sum + item.marks, 0);
  const tickedMarks = scheme.rubric.reduce((sum, item, i) => sum + (ticked.has(i) ? item.marks : 0), 0);
  // What the working is worth on top of the answer marks the grader already gave.
  const suggested = totalMarks > 0 ? Math.round(((points * tickedMarks) / totalMarks) * 100) / 100 : 0;

  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{t("worked.working")}</p>
        {given?.working.trim() ? <Maths text={given.working} /> : <p className="text-sm text-zinc-400">{t("quiz.noAnswer")}</p>}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <p>
          <span className="text-zinc-500">{t("worked.finalAnswer")}: </span>
          <span className="font-medium text-zinc-900">{given?.finalAnswer.trim() || "—"}</span>
        </p>
        {scheme.finalAnswer.trim() && (
          <p>
            <span className="text-zinc-500">{t("review.correctAnswer")}</span>
            <span className="font-medium text-zinc-900">{scheme.finalAnswer}</span>
          </p>
        )}
        {autoAwarded > 0 && <p className="text-green-700">+{autoAwarded}</p>}
      </div>

      {scheme.rubric.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{t("worked.markScheme")}</p>
          <ul className="space-y-1">
            {scheme.rubric.map((item, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={ticked.has(i)}
                    onChange={() =>
                      setTicked((old) => {
                        const next = new Set(old);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className="mt-1"
                  />
                  <span className="min-w-0 flex-1">{item.point}</span>
                  <span className="shrink-0 text-xs text-zinc-400">{t("answer.marks", { n: item.marks })}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-sm font-medium text-blue-700">{t("worked.suggested", { n: suggested })}</p>
        </div>
      )}

      {scheme.solution.trim() && (
        <details className="rounded-lg border border-zinc-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">{t("worked.solution")}</summary>
          <div className="mt-2">
            <Maths text={scheme.solution} />
          </div>
        </details>
      )}
    </div>
  );
}

function safeAnswer(value: unknown) {
  try {
    return parseCorrectAnswer("WORKED", value);
  } catch {
    return null;
  }
}

function safeResponse(value: unknown) {
  try {
    return parseResponse("WORKED", value);
  } catch {
    return null;
  }
}
