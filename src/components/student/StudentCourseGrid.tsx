"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/ui/icons";
import { badgeColorForKey } from "@/lib/ui/palette";
import { cardCls, inputCls } from "@/components/ui/styles";

export type StudentCourseCard = {
  id: string;
  title: string;
  description: string;
  /** Subject · level, when the tutor has set them. */
  subject: string;
  coverSrc: string | null;
  lessonCount: number;
  /** Null when lesson progress isn't switched on. */
  completed: number | null;
  pct: number | null;
};

// Searching only earns its space once the list is long enough to need it.
const SEARCH_FROM = 6;

export function StudentCourseGrid({ courses }: { courses: StudentCourseCard[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((c) => `${c.title} ${c.description} ${c.subject}`.toLowerCase().includes(needle));
  }, [courses, query]);

  if (courses.length === 0) {
    return (
      <div className={`${cardCls} px-5 py-12 text-center`}>
        <p className="text-sm font-medium text-zinc-700">No courses yet</p>
        <p className="mt-1 text-sm text-zinc-500">Your tutor will add you to one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.length >= SEARCH_FROM && (
        <div className="relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your courses"
            className={`${inputCls} pl-9`}
          />
        </div>
      )}

      {shown.length === 0 ? (
        <p className={`${cardCls} px-5 py-10 text-center text-sm text-zinc-500`}>No course matches that.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((course) => (
            <li key={course.id}>
              <Link
                href={`/courses/${course.id}`}
                className={`${cardCls} group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md`}
              >
                {course.coverSrc ? (
                  // Signed URL behind a redirect — not something next/image can optimise.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.coverSrc} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className={`flex aspect-[4/3] items-center justify-center ${badgeColorForKey(course.subject || course.title)}`}>
                    <span className="text-4xl font-semibold opacity-70">{course.title.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-3">
                  {course.subject && (
                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-zinc-500">{course.subject}</p>
                  )}
                  <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-blue-700">{course.title}</h2>
                  {course.description && <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{course.description}</p>}
                  <div className="mt-auto pt-3">
                    {course.pct === null ? (
                      <p className="text-xs text-zinc-400">{course.lessonCount} lessons</p>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-between gap-2 text-[11px] text-zinc-500">
                          <span>
                            {course.completed}/{course.lessonCount} lessons
                          </span>
                          <span className="font-medium text-zinc-700">{course.pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${course.pct}%` }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
