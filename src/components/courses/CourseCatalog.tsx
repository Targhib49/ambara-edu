"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CourseStatus } from "@/generated/prisma/enums";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ListIcon, SearchIcon, UsersIcon } from "@/components/ui/icons";
import { badgeColorForKey } from "@/lib/ui/palette";
import { cardCls, controlCls, inputCls } from "@/components/ui/styles";
import type { FacetSuggestions } from "@/components/courses/NewCourseForm";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Translate } from "@/lib/i18n/translate";

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

const STATUS_TABS: { key: StatusTab; labelKey: MessageKey; match: (c: CatalogCourse) => boolean }[] = [
  { key: "active", labelKey: "tutorCourses.tab.active", match: (c) => c.status !== "ARCHIVED" },
  { key: "PUBLISHED", labelKey: "tutorCourses.tab.published", match: (c) => c.status === "PUBLISHED" },
  { key: "DRAFT", labelKey: "tutorCourses.tab.drafts", match: (c) => c.status === "DRAFT" },
  { key: "ARCHIVED", labelKey: "tutorCourses.tab.archived", match: (c) => c.status === "ARCHIVED" },
];

const GRID_PAGE = 12;
const NOT_SET = "__none__";

const facetsOf = (c: CatalogCourse) => [c.subject, c.curriculum, c.level].filter(Boolean).join(" · ");
const contentOf = (c: CatalogCourse, tr: Translate) =>
  [
    tr("tutorCourses.chaptersCount", { n: c.chapters }),
    tr("tutorCourses.lessonsCount", { n: c.lessons }),
    tr("tutorCourses.quizzesCount", { n: c.quizzes }),
  ].join(" · ");

function StatusPill({ status, tr }: { status: CourseStatus; tr: Translate }) {
  if (status === "PUBLISHED") return null;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-zinc-200 text-zinc-700"
      }`}
    >
      {status === "DRAFT" ? tr("status.draft") : tr("status.archived")}
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

const makeListColumns = (tr: Translate): Column<CatalogCourse>[] => [
  {
    key: "title",
    header: tr("tutorCourses.course"),
    sort: (c) => c.title.toLowerCase(),
    text: (c) => c.title,
    className: "min-w-[260px]",
    cell: (c) => (
      <div className="flex items-center gap-3">
        <Cover course={c} className="h-10 w-16 shrink-0 rounded-md" />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-medium text-zinc-900">{c.title}</span>
            <StatusPill status={c.status} tr={tr} />
          </span>
          <span className="block truncate text-xs text-zinc-500">{facetsOf(c) || tr("tutorCourses.noSubject")}</span>
        </span>
      </div>
    ),
  },
  { key: "subject", header: tr("tutorCourses.filter.subject"), text: (c) => c.subject ?? "", csvOnly: true, cell: () => null },
  { key: "curriculum", header: tr("tutorCourses.filter.curriculum"), text: (c) => c.curriculum ?? "", csvOnly: true, cell: () => null },
  { key: "level", header: tr("tutorCourses.filter.level"), text: (c) => c.level ?? "", csvOnly: true, cell: () => null },
  {
    key: "content",
    header: tr("tutorCourses.contentHeader"),
    sort: (c) => c.lessons,
    text: (c) => tr("tutorCourses.contentCsv", { chapters: c.chapters, lessons: c.lessons, quizzes: c.quizzes }),
    className: "whitespace-nowrap text-xs",
    cell: (c) => contentOf(c, tr),
  },
  { key: "students", header: tr("tutorCourses.students"), sort: (c) => c.students, text: (c) => c.students, align: "right", className: "tabular-nums", cell: (c) => c.students },
  { key: "updated", header: tr("tutorCourses.updated"), sort: (c) => c.updatedAt, text: (c) => c.updatedLabel, className: "whitespace-nowrap", cell: (c) => c.updatedLabel },
];

export function CourseCatalog({ courses, suggestions }: { courses: CatalogCourse[]; suggestions: FacetSuggestions }) {
  const tr = useT();
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
      <option value="">{tr("tutorCourses.filter.any", { facet: label })}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={NOT_SET}>{tr("tutorCourses.filter.notSet")}</option>
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
            {tr(t.labelKey)}
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
            placeholder={tr("tutorCourses.search")}
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {facetSelect(tr("tutorCourses.filter.subject"), subject, setSubject, suggestions.subjects)}
          {facetSelect(tr("tutorCourses.filter.curriculum"), curriculum, setCurriculum, suggestions.curricula)}
          {facetSelect(tr("tutorCourses.filter.level"), level, setLevel, suggestions.levels)}
          <select value={sort} onChange={(e) => reset(setSort)(e.target.value as SortKey)} aria-label={tr("tutorCourses.sort.updated")} className={controlCls}>
            <option value="updated">{tr("tutorCourses.sort.updated")}</option>
            <option value="title">{tr("tutorCourses.sort.title")}</option>
            <option value="students">{tr("tutorCourses.sort.students")}</option>
          </select>
          <div className="flex rounded-md border border-zinc-300 bg-white p-0.5">
            {(
              [
                ["grid", GridIcon, tr("tutorCourses.gridView")],
                ["list", ListIcon, tr("tutorCourses.listView")],
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
          {tr("tutorCourses.matches", { n: visible.length })}
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
            {tr("tutorCourses.clearFilters")}
          </button>
        </div>
      )}

      {view === "list" ? (
        <DataTable
          key={`${tab}-${sort}`}
          rows={visible}
          columns={makeListColumns(tr)}
          rowKey={(c) => c.id}
          rowHref={(c) => `/tutor/courses/${c.id}`}
          exportName="courses"
          minWidth="720px"
          empty={{ title: tr("tutorCourses.empty"), hint: filtersOn ? tr("tutorCourses.emptyFiltered") : tr("tutorCourses.emptyHint") }}
        />
      ) : visible.length === 0 ? (
        <div className={`${cardCls} px-5 py-14 text-center`}>
          <p className="text-sm font-medium text-zinc-700">{tr("tutorCourses.empty")}</p>
          <p className="mt-1 text-sm text-zinc-500">{filtersOn ? tr("tutorCourses.emptyFiltered") : tr("tutorCourses.emptyHint")}</p>
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
                      <StatusPill status={c.status} tr={tr} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      {facetsOf(c) || tr("tutorCourses.noSubject")}
                    </p>
                    <h2 className="mt-1 line-clamp-2 font-semibold text-zinc-900 group-hover:text-blue-700">{c.title}</h2>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-zinc-500">
                      <span className="truncate">{contentOf(c, tr)}</span>
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
