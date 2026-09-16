"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { hintCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import type { PlacementCourse } from "@/lib/courses/placement";

export type Placement = {
  chapterId: string;
  lessonId: string;
  /** A chapter is chosen, and a lesson too if "After a lesson" is picked. */
  complete: boolean;
};

/**
 * Sent when "After a lesson" is picked but no lesson is, so the server rejects
 * it with a clear message instead of quietly saving an end-of-chapter test.
 * (Checked on the server rather than with `required`: the browser's own
 * "fill out this field" bubble lands on top of the picker's options.)
 */
export const LESSON_NOT_CHOSEN = "choose-lesson";

/**
 * Where a quiz sits in the syllabus, picked the way a tutor thinks about it:
 * which course, which chapter, then either at the end of the chapter (a chapter
 * test or try-out) or straight after one of its lessons.
 *
 * Writes `chapterId` and `lessonId` into the surrounding form; `onChange` is
 * for callers that submit without a form.
 */
export function QuizPlacementFields({
  tree,
  defaultCourseId,
  defaultChapterId,
  defaultLessonId,
  onChange,
}: {
  tree: PlacementCourse[];
  defaultCourseId?: string;
  defaultChapterId?: string | null;
  defaultLessonId?: string | null;
  onChange?: (placement: Placement) => void;
}) {
  const t = useT();
  const initialCourse =
    (defaultChapterId ? tree.find((c) => c.chapters.some((ch) => ch.id === defaultChapterId))?.id : undefined) ??
    defaultCourseId ??
    "";
  const [courseId, setCourseId] = useState(initialCourse);
  const [chapterId, setChapterId] = useState(defaultChapterId ?? "");
  const [position, setPosition] = useState<"end" | "lesson">(defaultLessonId ? "lesson" : "end");
  const [lessonId, setLessonId] = useState(defaultLessonId ?? "");

  const course = tree.find((c) => c.id === courseId) ?? null;
  const chapter = course?.chapters.find((ch) => ch.id === chapterId) ?? null;

  const courseOptions = useMemo(
    () =>
      tree
        .filter((c) => !c.archived || c.id === initialCourse)
        .map((c) => ({
          value: c.id,
          label: c.title,
          hint: t(c.chapters.length === 1 ? "count.chapter" : "count.chapters", { n: c.chapters.length }),
        })),
    [tree, initialCourse, t]
  );
  const chapterOptions = (course?.chapters ?? []).map((ch, i) => ({
    value: ch.id,
    label: ch.title,
    hint: t(ch.lessons.length === 1 ? "placement.chapterHint" : "placement.chapterHintPlural", { n: i + 1, c: ch.lessons.length }),
  }));
  const lessonOptions = (chapter?.lessons ?? []).map((l) => ({ value: l.id, label: l.title }));

  const emit = (chapter: string, pos: "end" | "lesson", lesson: string) =>
    onChange?.({
      chapterId: chapter,
      lessonId: pos === "lesson" ? lesson : "",
      complete: chapter !== "" && (pos === "end" || lesson !== ""),
    });
  const lessonValue = position === "lesson" ? lessonId || LESSON_NOT_CHOSEN : "";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>{t("studentDetail.course")}</label>
        <Combobox
          options={courseOptions}
          value={courseId}
          onChange={(value) => {
            setCourseId(value);
            setChapterId("");
            setLessonId("");
            emit("", position, "");
          }}
          placeholder={t("studentDetail.searchCourses")}
          aria-label={t("studentDetail.course")}
        />
      </div>

      <div>
        <label className={labelCls}>{t("placement.chapter")}</label>
        <Combobox
          name="chapterId"
          disabled={!course}
          options={chapterOptions}
          value={chapterId}
          onChange={(value) => {
            setChapterId(value);
            setLessonId("");
            emit(value, position, "");
          }}
          placeholder={course ? t("placement.searchChapters") : t("placement.chooseCourseFirst")}
          emptyText={course && course.chapters.length === 0 ? t("placement.noChapters") : t("placement.noMatches")}
          aria-label={t("placement.chapter")}
        />
      </div>

      <fieldset disabled={!chapter}>
        <legend className={labelCls}>{t("placement.shownToStudents")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["end", t("placement.atEndOfChapter"), t("placement.atEndSub")],
              ["lesson", t("quizTable.afterLesson"), t("placement.afterLessonSub")],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 ${
                position === value ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500" : "border-zinc-200 hover:border-zinc-300"
              } ${!chapter ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={position === value}
                onChange={() => {
                  setPosition(value);
                  emit(chapterId, value, lessonId);
                }}
              />
              <span className="block text-sm font-medium text-zinc-900">{title}</span>
              <span className="block text-xs text-zinc-500">{sub}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {position === "lesson" && chapter && (
        <div>
          <label className={labelCls}>{t("placement.lesson")}</label>
          <Combobox
            options={lessonOptions}
            value={lessonId}
            onChange={(value) => {
              setLessonId(value);
              emit(chapterId, position, value);
            }}
            placeholder={t("placement.searchLessons")}
            emptyText={t("placement.noLessons")}
            aria-label={t("placement.lesson")}
          />
          <p className={hintCls}>{t("placement.severalQuizzes")}</p>
        </div>
      )}

      <input type="hidden" name="lessonId" value={lessonValue} />
    </div>
  );
}
