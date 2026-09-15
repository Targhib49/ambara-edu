"use client";

import { createCourse } from "@/lib/actions/courses";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";

export type FacetSuggestions = { subjects: string[]; curricula: string[]; levels: string[] };

/** The subject / curriculum / level trio, suggesting values already in use so the catalogue stays tidy. */
export function CourseFacetFields({
  suggestions,
  defaults,
}: {
  suggestions: FacetSuggestions;
  defaults?: { subject?: string | null; curriculum?: string | null; level?: string | null };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(
        [
          ["subject", "Subject", "e.g. Mathematics", suggestions.subjects, defaults?.subject],
          ["curriculum", "Curriculum", "e.g. Kurikulum Merdeka", suggestions.curricula, defaults?.curriculum],
          ["level", "Level", "e.g. Kelas 7, Beginner", suggestions.levels, defaults?.level],
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
  const panel = useSlideOver();
  return (
    <form action={createCourse} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="course-title">
          Title
        </label>
        <input id="course-title" name="title" required placeholder="e.g. Excel for Data Analysts" className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="course-description">
          Description
        </label>
        <textarea id="course-description" name="description" rows={3} className={inputCls} />
      </div>
      <CourseFacetFields suggestions={suggestions} />
      <p className={hintCls}>
        Subject, curriculum and level are how you&rsquo;ll filter the catalogue later — pick an existing value where one fits.
        The course starts as a draft, hidden from students.
      </p>
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            Cancel
          </button>
        )}
        <SubmitButton pendingLabel="Creating…" className={btnPrimary}>
          Create course
        </SubmitButton>
      </div>
    </form>
  );
}
