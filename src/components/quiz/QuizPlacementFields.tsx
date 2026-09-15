"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { hintCls, labelCls } from "@/components/ui/styles";
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
        .map((c) => ({ value: c.id, label: c.title, hint: `${c.chapters.length} chapter${c.chapters.length === 1 ? "" : "s"}` })),
    [tree, initialCourse]
  );
  const chapterOptions = (course?.chapters ?? []).map((ch, i) => ({
    value: ch.id,
    label: ch.title,
    hint: `Chapter ${i + 1} · ${ch.lessons.length} lesson${ch.lessons.length === 1 ? "" : "s"}`,
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
        <label className={labelCls}>Course</label>
        <Combobox
          options={courseOptions}
          value={courseId}
          onChange={(value) => {
            setCourseId(value);
            setChapterId("");
            setLessonId("");
            emit("", position, "");
          }}
          placeholder="Search courses"
          aria-label="Course"
        />
      </div>

      <div>
        <label className={labelCls}>Chapter</label>
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
          placeholder={course ? "Search chapters" : "Choose a course first"}
          emptyText={course && course.chapters.length === 0 ? "This course has no chapters yet" : "No matches"}
          aria-label="Chapter"
        />
      </div>

      <fieldset disabled={!chapter}>
        <legend className={labelCls}>Shown to students</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["end", "At the end of the chapter", "A chapter test or try-out, after the last lesson"],
              ["lesson", "After a lesson", "A quiz on one lesson, right after it"],
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
          <label className={labelCls}>Lesson</label>
          <Combobox
            options={lessonOptions}
            value={lessonId}
            onChange={(value) => {
              setLessonId(value);
              emit(chapterId, position, value);
            }}
            placeholder="Search lessons in this chapter"
            emptyText="This chapter has no lessons yet"
            aria-label="Lesson"
          />
          <p className={hintCls}>Several quizzes can follow the same lesson.</p>
        </div>
      )}

      <input type="hidden" name="lessonId" value={lessonValue} />
    </div>
  );
}
