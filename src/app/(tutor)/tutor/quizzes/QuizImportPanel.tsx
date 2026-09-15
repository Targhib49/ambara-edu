"use client";

import { useState, useTransition } from "react";
import { previewImport, commitImport, type CommitImportTarget } from "@/lib/actions/quizzes";
import type { ImportResult } from "@/lib/quiz/import";
import { QuizPlacementFields, type Placement } from "@/components/quiz/QuizPlacementFields";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "@/components/ui/styles";
import type { PlacementCourse } from "@/lib/courses/placement";

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  MULTI_SELECT: "Multi-select",
  NUMERIC: "Numeric",
  SHORT_TEXT: "Short text",
  CODE: "Code",
};

/**
 * Lives in the "Import questions" panel. Upload, check the preview, then say
 * which quiz the questions go into — nothing is saved before that last step.
 */
export function QuizImportPanel({ tree, quizOptions }: { tree: PlacementCourse[]; quizOptions: ComboOption[] }) {
  const panel = useSlideOver();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mode, setMode] = useState<"new" | "update">("new");
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState<Placement>({ chapterId: "", lessonId: "", complete: false });
  const [existingQuizId, setExistingQuizId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handlePreview(formData: FormData) {
    setResult(null);
    setError(null);
    startTransition(async () => setResult(await previewImport(formData)));
  }

  function handleCommit() {
    if (!result || result.drafts.length === 0) return;
    const target: CommitImportTarget =
      mode === "new"
        ? { mode: "new", title, chapterId: placement.chapterId, lessonId: placement.lessonId || null }
        : { mode: "update", quizId: existingQuizId };
    startTransition(async () => {
      const outcome = await commitImport(target, result.drafts);
      if (outcome?.error) setError(outcome.error);
    });
  }

  const ready = !!result && result.errors.length === 0 && result.drafts.length > 0;
  const canCommit =
    ready && (mode === "new" ? title.trim().length > 0 && placement.complete : existingQuizId !== "");

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900">1. Upload a sheet</h3>
        <form action={handlePreview} className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            required
            className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
          <button disabled={pending} className={btnSecondary}>
            {pending && !result ? "Reading…" : "Preview"}
          </button>
        </form>
        <details className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          <summary className="cursor-pointer font-medium text-zinc-700">Sheet format</summary>
          <p className="mt-2">
            One row per question. Columns: <code>question_type</code>, <code>question_text</code>, <code>option_a</code>…
            <code>option_d</code>, <code>correct_answer</code>, <code>points</code>, <code>explanation</code>. For code questions,
            <code> correct_answer</code> is an optional JSON list of test cases, e.g.{" "}
            <code>{'[{"input":"3","expected_output":"6"}]'}</code> — leave it blank to grade by hand.
          </p>
        </details>
      </section>

      {result && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">2. Check the questions</h3>
          {result.errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="mb-1.5 text-sm font-medium text-red-800">
                Fix {result.errors.length} row{result.errors.length > 1 ? "s" : ""} and upload again:
              </p>
              <ul className="max-h-40 space-y-0.5 overflow-y-auto text-sm text-red-700">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.rowNumber}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.drafts.length > 0 && (
            <div className="max-h-72 overflow-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Question</th>
                    <th className="px-3 py-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {result.drafts.map((d) => (
                    <tr key={d.rowNumber}>
                      <td className="px-3 py-2 tabular-nums text-zinc-500">{d.rowNumber}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-zinc-600">{TYPE_LABELS[d.type]}</td>
                      <td className="max-w-md truncate px-3 py-2">{d.prompt}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {ready && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">3. Choose where they go</h3>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1">
            {(
              [
                ["new", "New quiz"],
                ["update", "Replace an existing quiz's questions"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                disabled={value === "update" && quizOptions.length === 0}
                aria-pressed={mode === value}
                className={`rounded-md px-2 py-1.5 text-sm font-medium disabled:opacity-40 ${
                  mode === value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "new" ? (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Quiz title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              </div>
              <QuizPlacementFields tree={tree} onChange={setPlacement} />
            </div>
          ) : (
            <div>
              <label className={labelCls}>Quiz</label>
              <Combobox options={quizOptions} value={existingQuizId} onChange={setExistingQuizId} placeholder="Search quizzes" aria-label="Quiz to replace" />
              <p className="mt-1 text-xs text-amber-700">Its current questions are replaced. Existing submissions are kept.</p>
            </div>
          )}
        </section>
      )}

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            Cancel
          </button>
        )}
        <button onClick={handleCommit} disabled={!canCommit || pending} className={btnPrimary}>
          {pending && result ? "Importing…" : ready ? `Import ${result!.drafts.length} question${result!.drafts.length > 1 ? "s" : ""}` : "Import"}
        </button>
      </div>
    </div>
  );
}
