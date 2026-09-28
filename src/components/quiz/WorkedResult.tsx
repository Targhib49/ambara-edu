import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";
import { getT } from "@/lib/i18n/server";

/**
 * A competition answer as the student reads it back: their own working, and
 * the model solution — but only once the tutor has marked it, since handing
 * over the solution while the marking is pending gives the answer away to
 * anyone who resubmits.
 */
export async function WorkedResult({
  correctAnswer,
  response,
  reviewed,
}: {
  correctAnswer: unknown;
  response: unknown;
  reviewed: boolean;
}) {
  const t = await getT();
  const scheme = safe(() => parseCorrectAnswer("WORKED", correctAnswer));
  const given = safe(() => parseResponse("WORKED", response));

  return (
    <div className="mt-2 space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{t("worked.working")}</p>
        {given?.working.trim() ? (
          <div className="prose prose-sm prose-zinc max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {given.working}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">{t("quiz.noAnswer")}</p>
        )}
        {given?.finalAnswer.trim() && (
          <p className="mt-2 text-sm">
            <span className="text-zinc-500">{t("worked.finalAnswer")}: </span>
            <span className="font-medium text-zinc-900">{given.finalAnswer}</span>
          </p>
        )}
      </div>

      {reviewed && scheme?.solution.trim() && (
        <details className="rounded-lg border border-zinc-200 p-3" open>
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">{t("worked.solution")}</summary>
          <div className="prose prose-sm prose-zinc mt-2 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {scheme.solution}
            </ReactMarkdown>
          </div>
        </details>
      )}
    </div>
  );
}

function safe<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}
