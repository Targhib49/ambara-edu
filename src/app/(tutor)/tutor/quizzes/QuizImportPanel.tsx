"use client";

import { useState, useTransition } from "react";
import { previewImport, commitImport, type CommitImportTarget } from "@/lib/actions/quizzes";
import type { ImportResult } from "@/lib/quiz/import";
import { QuizPlacementFields, type Placement } from "@/components/quiz/QuizPlacementFields";
import { QuizStyleField } from "@/components/quiz/QuizStyleField";
import type { QuizStyle } from "@/generated/prisma/enums";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { PlacementCourse } from "@/lib/courses/placement";

const TYPE_KEYS: Record<string, MessageKey> = {
  MULTIPLE_CHOICE: "questionType.MULTIPLE_CHOICE",
  MULTI_SELECT: "questionType.MULTI_SELECT",
  NUMERIC: "questionType.NUMERIC",
  SHORT_TEXT: "questionType.SHORT_TEXT",
  CODE: "questionType.CODE",
};

/**
 * Lives in the "Import questions" panel. Upload, check the preview, then say
 * which quiz the questions go into — nothing is saved before that last step.
 */
export function QuizImportPanel({ tree, quizOptions }: { tree: PlacementCourse[]; quizOptions: ComboOption[] }) {
  const t = useT();
  const panel = useSlideOver();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mode, setMode] = useState<"new" | "update">("new");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<QuizStyle>("CLASSIC");
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
        ? { mode: "new", title, chapterId: placement.chapterId, lessonId: placement.lessonId || null, style }
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
        <h3 className="text-sm font-semibold text-zinc-900">{t("quizImport.step1")}</h3>
        <form action={handlePreview} className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls"
            required
            className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
          <button disabled={pending} className={btnSecondary}>
            {pending && !result ? t("quizImport.reading") : t("quizImport.preview")}
          </button>
        </form>
        <details className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          <summary className="cursor-pointer font-medium text-zinc-700">{t("quizImport.sheetFormat")}</summary>
          <p className="mt-2">
            {t("quizImport.formatIntro")} <code>question_type</code>, <code>question_text</code>, <code>option_a</code>…
            <code>option_d</code>, <code>correct_answer</code>, <code>points</code>, <code>explanation</code>.{" "}
            {t("quizImport.formatCode")}
            <code> correct_answer</code> {t("quizImport.formatCodeTail")}{" "}
            <code>{'[{"input":"3","expected_output":"6"}]'}</code> {t("quizImport.formatBlank")}
          </p>
        </details>
      </section>

      {result && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">{t("quizImport.step2")}</h3>
          {result.errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="mb-1.5 text-sm font-medium text-red-800">
                {t(result.errors.length > 1 ? "quizImport.fixRows" : "quizImport.fixRow", { n: result.errors.length })}
              </p>
              <ul className="max-h-40 space-y-0.5 overflow-y-auto text-sm text-red-700">
                {result.errors.map((e, i) => (
                  <li key={i}>{t("quizImport.rowError", { n: e.rowNumber, message: e.message })}</li>
                ))}
              </ul>
            </div>
          )}
          {result.drafts.length > 0 && (
            <div className="max-h-72 overflow-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">{t("quizImport.row")}</th>
                    <th className="px-3 py-2">{t("quizImport.type")}</th>
                    <th className="px-3 py-2">{t("quizImport.question")}</th>
                    <th className="px-3 py-2 text-right">{t("quizImport.points")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {result.drafts.map((d) => (
                    <tr key={d.rowNumber}>
                      <td className="px-3 py-2 tabular-nums text-zinc-500">{d.rowNumber}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-zinc-600">{TYPE_KEYS[d.type] ? t(TYPE_KEYS[d.type]) : d.type}</td>
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
          <h3 className="text-sm font-semibold text-zinc-900">{t("quizImport.step3")}</h3>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1">
            {(
              [
                ["new", t("quizImport.modeNew")],
                ["update", t("quizImport.modeUpdate")],
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
                <label className={labelCls}>{t("quizImport.quizTitle")}</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              </div>
              <QuizPlacementFields tree={tree} onChange={setPlacement} />
              <QuizStyleField value={style} onChange={setStyle} exclude={["DRILL"]} />
            </div>
          ) : (
            <div>
              <label className={labelCls}>{t("quizImport.quiz")}</label>
              <Combobox options={quizOptions} value={existingQuizId} onChange={setExistingQuizId} placeholder={t("quizImport.searchQuizzes")} aria-label={t("quizImport.quizToReplace")} />
              <p className="mt-1 text-xs text-amber-700">{t("quizImport.replaceWarning")}</p>
            </div>
          )}
        </section>
      )}

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button onClick={handleCommit} disabled={!canCommit || pending} className={btnPrimary}>
          {pending && result
            ? t("quizImport.importing")
            : ready
              ? t(result!.drafts.length > 1 ? "quizImport.importNPlural" : "quizImport.importN", { n: result!.drafts.length })
              : t("quizImport.import")}
        </button>
      </div>
    </div>
  );
}
