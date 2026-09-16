"use client";

import { createCourse } from "@/lib/actions/courses";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";

export type FacetSuggestions = { subjects: string[]; curricula: string[]; levels: string[] };

/** The subject / curriculum / level trio, suggesting values already in use so the catalogue stays tidy. */
export function CourseFacetFields({
  suggestions,
  defaults,
}: {
  suggestions: FacetSuggestions;
  defaults?: { subject?: string | null; curriculum?: string | null; level?: string | null };
}) {
  const t = useT();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(
        [
          ["subject", t("courseForm.subject"), t("courseForm.subjectPlaceholder"), suggestions.subjects, defaults?.subject],
          ["curriculum", t("courseForm.curriculum"), t("courseForm.curriculumPlaceholder"), suggestions.curricula, defaults?.curriculum],
          ["level", t("courseForm.level"), t("courseForm.levelPlaceholder"), suggestions.levels, defaults?.level],
        ] as const
      ).map(([name, label, placeholder, options, value]) => (
        <div key={name}>
          <label className={labelCls} htmlFor={`course-${name}`}>
            {label}
          </label>
          <input
            id={`course-${name}`}
            name={name}
            list={`course-${name}-options`}
            defaultValue={value ?? ""}
            placeholder={placeholder}
            autoComplete="off"
            className={inputCls}
          />
          <datalist id={`course-${name}-options`}>
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>
      ))}
    </div>
  );
}

/** Lives in the "New course" panel. */
export function NewCourseForm({ suggestions }: { suggestions: FacetSuggestions }) {
  const t = useT();
  const panel = useSlideOver();
  return (
    <form action={createCourse} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="course-title">
          {t("courseEditor.title")}
        </label>
        <input id="course-title" name="title" required placeholder={t("courseForm.titlePlaceholder")} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="course-description">
          {t("courseEditor.description")}
        </label>
        <textarea id="course-description" name="description" rows={3} className={inputCls} />
      </div>
      <CourseFacetFields suggestions={suggestions} />
      <p className={hintCls}>{t("courseForm.hint")}</p>
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <SubmitButton pendingLabel={t("courseForm.creating")} className={btnPrimary}>
          {t("courseForm.create")}
        </SubmitButton>
      </div>
    </form>
  );
}
