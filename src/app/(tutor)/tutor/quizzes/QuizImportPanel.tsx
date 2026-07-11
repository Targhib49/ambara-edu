"use client";

import { useRef, useState, useTransition } from "react";
import { previewImport, commitImport, type CommitImportTarget } from "@/lib/actions/quizzes";
import type { ImportResult } from "@/lib/quiz/import";

const inputCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  MULTI_SELECT: "Multi-select",
  NUMERIC: "Numeric",
  SHORT_TEXT: "Short text",
  CODE: "Code",
};

export function QuizImportPanel({
  lessonOptions,
  quizOptions,
}: {
  lessonOptions: { id: string; label: string }[];
  quizOptions: { id: string; title: string }[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mode, setMode] = useState<"new" | "update">("new");
  const [title, setTitle] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [existingQuizId, setExistingQuizId] = useState(quizOptions[0]?.id ?? "");

  function handlePreview(formData: FormData) {
    startTransition(async () => {
      const r = await previewImport(formData);
      setResult(r);
    });
  }

  function handleCommit() {
    if (!result || result.drafts.length === 0) return;
    const target: CommitImportTarget =
      mode === "new" ? { mode: "new", title, lessonId: lessonId || null } : { mode: "update", quizId: existingQuizId };
    startTransition(() => commitImport(target, result.drafts));
  }

  const canCommit =
    !!result &&
    result.errors.length === 0 &&
    result.drafts.length > 0 &&
    (mode === "new" ? title.trim().length > 0 : !!existingQuizId);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-medium">Import quiz from CSV/Excel</h2>
      <p className="text-xs text-zinc-500">
        One row per question. Columns: lesson (optional), question_type, question_text, option_a..d,
        correct_answer, points, explanation. Upload to preview before anything is saved.
      </p>

      <form
        action={handlePreview}
        onSubmit={() => setResult(null)}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".csv,.xlsx,.xls"
          required
          className="text-sm"
        />
        <button
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
        >
          {pending && !result ? "Parsing…" : "Preview"}
        </button>
      </form>

      {result && (
        <div className="space-y-4 border-t border-zinc-100 pt-4">
          {result.errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="mb-1.5 text-sm font-medium text-red-800">
                {result.errors.length} row{result.errors.length > 1 ? "s" : ""} need fixing before you can import:
              </p>
              <ul className="space-y-0.5 text-sm text-red-700">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.rowNumber}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.drafts.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Question</th>
                    <th className="px-3 py-2">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {result.drafts.map((d) => (
                    <tr key={d.rowNumber}>
                      <td className="px-3 py-2 text-zinc-500">{d.rowNumber}</td>
                      <td className="px-3 py-2 text-zinc-600">{TYPE_LABELS[d.type]}</td>
                      <td className="max-w-xs truncate px-3 py-2">{d.prompt}</td>
                      <td className="px-3 py-2 text-zinc-600">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.errors.length === 0 && result.drafts.length > 0 && (
            <div className="space-y-3 rounded-md bg-zinc-50 p-4">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={mode === "new"}
                    onChange={() => setMode("new")}
                  />
                  Create new quiz
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={mode === "update"}
                    onChange={() => setMode("update")}
                    disabled={quizOptions.length === 0}
                  />
                  Update existing quiz
                </label>
              </div>

              {mode === "new" ? (
                <div className="flex flex-wrap gap-2">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Quiz title"
                    className={`${inputCls} max-w-xs`}
                  />
                  <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={`${inputCls} max-w-xs`}>
                    <option value="">Standalone (no lesson)</option>
                    {lessonOptions.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <select
                  value={existingQuizId}
                  onChange={(e) => setExistingQuizId(e.target.value)}
                  className={`${inputCls} max-w-xs`}
                >
                  {quizOptions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleCommit}
                disabled={!canCommit || pending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {pending ? "Importing…" : `Import ${result.drafts.length} question${result.drafts.length > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
