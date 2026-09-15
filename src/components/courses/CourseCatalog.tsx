"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CourseStatus } from "@/generated/prisma/enums";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ListIcon, SearchIcon, UsersIcon } from "@/components/ui/icons";
import { badgeColorForKey } from "@/lib/ui/palette";
import { cardCls, controlCls, inputCls } from "@/components/ui/styles";
import type { FacetSuggestions } from "@/components/courses/NewCourseForm";

export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  curriculum: string | null;
  level: string | null;
  status: CourseStatus;
  coverSrc: string | null;
  chapters: number;
  lessons: number;
  quizzes: number;
  students: number;
  updatedAt: string;
  updatedLabel: string;
};

type StatusTab = "active" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
type SortKey = "updated" | "title" | "students";

const STATUS_TABS: { key: StatusTab; label: string; match: (c: CatalogCourse) => boolean }[] = [
  { key: "active", label: "All active", match: (c) => c.status !== "ARCHIVED" },
  { key: "PUBLISHED", label: "Published", match: (c) => c.status === "PUBLISHED" },
  { key: "DRAFT", label: "Drafts", match: (c) => c.status === "DRAFT" },
  { key: "ARCHIVED", label: "Archived", match: (c) => c.status === "ARCHIVED" },
];

const GRID_PAGE = 12;
const NOT_SET = "__none__";

const facetsOf = (c: CatalogCourse) => [c.subject, c.curriculum, c.level].filter(Boolean).join(" · ");
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const contentOf = (c: CatalogCourse) => `${plural(c.chapters, "chapter")} · ${plural(c.lessons, "lesson")} · ${plural(c.quizzes, "quiz")}`.replace("quizs", "quizzes");

function StatusPill({ status }: { status: CourseStatus }) {
  if (status === "PUBLISHED") return null;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-zinc-200 text-zinc-700"
      }`}
    >
      {status === "DRAFT" ? "Draft" : "Archived"}
    </span>
  );
}

function Cover({ course, className }: { course: CatalogCourse; className: string }) {
  if (course.coverSrc) {
    // Signed URL behind a redirect — not something next/image can optimise.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={course.coverSrc} alt="" loading="lazy" className={`${className} object-cover`} />;
  }
  return (
    <div className={`${className} grid place-items-center ${badgeColorForKey(course.subject ?? course.title)}`}>
      <span className="text-3xl font-semibold opacity-80">{course.title.charAt(0).toUpperCase()}</span>
    </div>
  );
}

const LIST_COLUMNS: Column<CatalogCourse>[] = [
  {
    key: "title",
    header: "Course",
    sort: (c) => c.title.toLowerCase(),
    text: (c) => c.title,
    className: "min-w-[260px]",
    cell: (c) => (
      <div className="flex items-center gap-3">
        <Cover course={c} className="h-10 w-16 shrink-0 rounded-md" />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-medium text-zinc-900">{c.title}</span>
            <StatusPill status={c.status} />
          </span>
          <span className="block truncate text-xs text-zinc-500">{facetsOf(c) || "No subject set"}</span>
        </span>
      </div>
    ),
  },
  { key: "subject", header: "Subject", text: (c) => c.subject ?? "", csvOnly: true, cell: () => null },
  { key: "curriculum", header: "Curriculum", text: (c) => c.curriculum ?? "", csvOnly: true, cell: () => null },
  { key: "level", header: "Level", text: (c) => c.level ?? "", csvOnly: true, cell: () => null },
  {
    key: "content",
    header: "Content",
    sort: (c) => c.lessons,
    text: (c) => `${c.chapters} chapters, ${c.lessons} lessons, ${c.quizzes} quizzes`,
    className: "whitespace-nowrap text-xs",
    cell: (c) => contentOf(c),
  },
  { key: "students", header: "Students", sort: (c) => c.students, text: (c) => c.students, align: "right", className: "tabular-nums", cell: (c) => c.students },
  { key: "updated", header: "Updated", sort: (c) => c.updatedAt, text: (c) => c.updatedLabel, className: "whitespace-nowrap", cell: (c) => c.updatedLabel },
];

export function CourseCatalog({ courses, suggestions }: { courses: CatalogCourse[]; suggestions: FacetSuggestions }) {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [level, setLevel] = useState("");
  const [tab, setTab] = useState<StatusTab>("active");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // Every control sends you back to the first page, in its own handler.
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const narrowed = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const facetMatch = (value: string | null, wanted: string) =>
      !wanted || (wanted === NOT_SET ? !value : value === wanted);
    return courses.filter(
      (c) =>
        (!needle || `${c.title} ${c.description} ${facetsOf(c)}`.toLowerCase().includes(needle)) &&
        facetMatch(c.subject, subject) &&
        facetMatch(c.curriculum, curriculum) &&
        facetMatch(c.level, level)
    );
  }, [courses, q, subject, curriculum, level]);

  const counts = Object.fromEntries(STATUS_TABS.map((t) => [t.key, narrowed.filter(t.match).length])) as Record<StatusTab, number>;

  const visible = useMemo(() => {
    const active = STATUS_TABS.find((t) => t.key === tab)!;
    const list = narrowed.filter(active.match);
    return [...list].sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : sort === "students" ? b.students - a.students : b.updatedAt.localeCompare(a.updatedAt)
    );
  }, [narrowed, tab, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / GRID_PAGE));
  const current = Math.min(page, pages);
  const shown = visible.slice((current - 1) * GRID_PAGE, current * GRID_PAGE);
  const filtersOn = Boolean(q || subject || curriculum || level);

  const facetSelect = (label: string, value: string, set: (v: string) => void, options: string[]) => (
    <select
      value={value}
      onChange={(e) => reset(set)(e.target.value)}
      aria-label={label}
      className={`${controlCls} min-w-[9rem] ${value ? "border-blue-400 bg-blue-50/50 text-blue-900" : ""}`}
    >
      <option value="">{label}: any</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={NOT_SET}>Not set</option>
    </select>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => reset(setTab)(t.key)}
            aria-pressed={tab === t.key}
            className={`h-9 rounded-md px-3.5 text-[13px] font-medium ${
              tab === t.key ? "bg-slate-900 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 tabular-nums ${tab === t.key ? "text-white/60" : "text-zinc-400"}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Search gets its own row until there's room beside the filters, so it never
          shrinks to an icon. */}
      <div className={`${cardCls} flex flex-col gap-3 p-3 xl:flex-row xl:items-center`}>
        <div className="relative min-w-0 flex-1 xl:min-w-[18rem]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => reset(setQ)(e.target.value)}
            placeholder="Search title, description, subject…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {facetSelect("Subject", subject, setSubject, suggestions.subjects)}
          {facetSelect("Curriculum", curriculum, setCurriculum, suggestions.curricula)}
          {facetSelect("Level", level, setLevel, suggestions.levels)}
          <select value={sort} onChange={(e) => reset(setSort)(e.target.value as SortKey)} aria-label="Sort" className={controlCls}>
            <option value="updated">Recently updated</option>
            <option value="title">Title A–Z</option>
            <option value="students">Most students</option>
          </select>
          <div className="flex rounded-md border border-zinc-300 bg-white p-0.5">
            {(
              [
                ["grid", GridIcon, "Grid view"],
                ["list", ListIcon, "List view"],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                aria-label={label}
                aria-pressed={view === key}
                className={`grid h-8 w-8 place-items-center rounded ${view === key ? "bg-slate-900 text-white" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtersOn && (
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          {visible.length} match{visible.length === 1 ? "" : "es"}
          <button
            onClick={() => {
              setQ("");
              setSubject("");
              setCurriculum("");
              setLevel("");
              setPage(1);
            }}
            className="font-medium text-blue-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {view === "list" ? (
        <DataTable
          key={`${tab}-${sort}`}
          rows={visible}
          columns={LIST_COLUMNS}
          rowKey={(c) => c.id}
          rowHref={(c) => `/tutor/courses/${c.id}`}
          exportName="courses"
          minWidth="720px"
          empty={{ title: "No courses here", hint: filtersOn ? "Try clearing the filters." : "Create one with “New course”." }}
        />
      ) : visible.length === 0 ? (
        <div className={`${cardCls} px-5 py-14 text-center`}>
          <p className="text-sm font-medium text-zinc-700">No courses here</p>
          <p className="mt-1 text-sm text-zinc-500">{filtersOn ? "Try clearing the filters." : "Create one with “New course”."}</p>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/tutor/courses/${c.id}`}
                  className={`${cardCls} group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md`}
                >
                  <div className="relative">
                    <Cover course={c} className="aspect-[16/9] w-full" />
                    <span className="absolute left-2 top-2">
                      <StatusPill status={c.status} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-zinc-500">{facetsOf(c) || "No subject set"}</p>
                    <h2 className="mt-1 line-clamp-2 font-semibold text-zinc-900 group-hover:text-blue-700">{c.title}</h2>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-zinc-500">
                      <span className="truncate">{contentOf(c)}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" />
                        {c.students}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {visible.length > GRID_PAGE && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs tabular-nums text-zinc-500">
                {(current - 1) * GRID_PAGE + 1}–{Math.min(current * GRID_PAGE, visible.length)} of {visible.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page" className="grid h-9 place-items-center rounded-md border border-zinc-300 bg-white px-3 text-zinc-700 disabled:opacity-40">
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-xs tabular-nums text-zinc-500">
                  {current} / {pages}
                </span>
                <button onClick={() => setPage(Math.min(pages, current + 1))} disabled={current >= pages} aria-label="Next page" className="grid h-9 place-items-center rounded-md border border-zinc-300 bg-white px-3 text-zinc-700 disabled:opacity-40">
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
