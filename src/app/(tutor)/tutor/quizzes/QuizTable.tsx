"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";

export type TutorQuizRow = {
  id: string;
  title: string;
  isDraft: boolean;
  /** Lesson it hangs off, or null for a standalone try-out. */
  lessonTitle: string | null;
  trackTitle: string | null;
  questionCount: number;
  totalPoints: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  submissionCount: number;
  pendingCount: number;
  createdAt: string;
};

type SortKey = "title" | "questions" | "submissions" | "pending" | "createdAt";
type Filter = "all" | "published" | "draft" | "review";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "review", label: "Needs review" },
];

function Th({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey?: SortKey;
  active: SortKey;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  if (!sortKey) return <th className={`px-4 py-3 font-medium ${className}`}>{label}</th>;
  const isActive = active === sortKey;
  return (
    <th className={`px-4 py-3 font-medium ${className}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-zinc-700 ${
          isActive ? "text-zinc-700" : ""
        }`}
      >
        {label}
        <span aria-hidden className={isActive ? "" : "opacity-0 group-hover/head:opacity-40"}>
          {isActive && dir === "asc" ? "↑" : "↓"}
        </span>
      </button>
    </th>
  );
}

export function QuizTable({ quizzes }: { quizzes: TutorQuizRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const counts = useMemo(
    () => ({
      all: quizzes.length,
      published: quizzes.filter((q) => !q.isDraft).length,
      draft: quizzes.filter((q) => q.isDraft).length,
      review: quizzes.filter((q) => q.pendingCount > 0).length,
    }),
    [quizzes]
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = quizzes.filter((q) => {
      if (filter === "published" && q.isDraft) return false;
      if (filter === "draft" && !q.isDraft) return false;
      if (filter === "review" && q.pendingCount === 0) return false;
      if (!needle) return true;
      return [q.title, q.lessonTitle, q.trackTitle]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(needle));
    });
    const sign = dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "title":
          return sign * a.title.localeCompare(b.title);
        case "questions":
          return sign * (a.questionCount - b.questionCount);
        case "submissions":
          return sign * (a.submissionCount - b.submissionCount);
        case "pending":
          return sign * (a.pendingCount - b.pendingCount);
        case "createdAt":
          return sign * a.createdAt.localeCompare(b.createdAt);
      }
    });
  }, [quizzes, query, filter, sort, dir]);

  const onSort = (key: SortKey) => {
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "title" ? "asc" : "desc");
    }
  };

  if (quizzes.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No quizzes yet — create one above, or import from CSV below.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
              } ${f.key === "review" && counts.review > 0 && filter !== f.key ? "text-amber-700" : ""}`}
            >
              {f.label}
              <span className={filter === f.key ? "ml-1.5 opacity-70" : "ml-1.5 text-zinc-400"}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search quizzes…"
          className="ml-auto w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none sm:w-56"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="group/head border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <Th label="Quiz" sortKey="title" active={sort} dir={dir} onSort={onSort} className="w-[30%]" />
              <Th label="Attached to" active={sort} dir={dir} onSort={onSort} className="hidden w-[22%] sm:table-cell" />
              <Th label="Questions" sortKey="questions" active={sort} dir={dir} onSort={onSort} className="hidden w-[13%] lg:table-cell" />
              <Th label="Format" active={sort} dir={dir} onSort={onSort} className="hidden w-[13%] lg:table-cell" />
              <Th label="Submissions" sortKey="submissions" active={sort} dir={dir} onSort={onSort} className="hidden w-[9%] md:table-cell" />
              <Th label="Needs review" sortKey="pending" active={sort} dir={dir} onSort={onSort} className="w-[13%]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((q) => (
              <tr
                key={q.id}
                onClick={() => router.push(`/tutor/quizzes/${q.id}`)}
                className="cursor-pointer transition hover:bg-blue-50/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold ${badgeColorForKey(q.title)}`}
                    >
                      {initialsFor(q.title) || "Q"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/tutor/quizzes/${q.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium text-zinc-900 hover:text-blue-700"
                      >
                        {q.title}
                      </Link>
                      {q.isDraft && (
                        <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Draft
                        </span>
                      )}
                      <span className="block truncate text-xs text-zinc-500 lg:hidden">
                        <span className="sm:hidden">{q.lessonTitle ?? "Try-out"} · </span>
                        {q.questionCount} questions · {q.totalPoints} pts
                        {q.timeLimitMinutes ? ` · ⏱ ${q.timeLimitMinutes} min` : ""}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell">
                  {q.lessonTitle ? (
                    <span className="block truncate">
                      {q.lessonTitle}
                      {q.trackTitle && (
                        <span className="block truncate text-xs text-zinc-400">{q.trackTitle}</span>
                      )}
                    </span>
                  ) : (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                      Try-out
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 whitespace-nowrap text-zinc-600 lg:table-cell">
                  {q.questionCount}
                  <span className="text-zinc-400"> · {q.totalPoints} pts</span>
                </td>
                <td className="hidden px-4 py-3 whitespace-nowrap text-xs text-zinc-500 lg:table-cell">
                  {q.timeLimitMinutes || q.maxAttempts ? (
                    <>
                      {q.timeLimitMinutes && <span className="block">⏱ {q.timeLimitMinutes} min</span>}
                      {q.maxAttempts && (
                        <span className="block">
                          {q.maxAttempts} attempt{q.maxAttempts === 1 ? "" : "s"}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-zinc-400">Untimed</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">{q.submissionCount}</td>
                <td className="px-4 py-3">
                  {q.pendingCount > 0 ? (
                    <Link
                      href={`/tutor/quizzes/${q.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-700 hover:bg-amber-200"
                    >
                      {q.pendingCount} to grade →
                    </Link>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No quizzes match that filter.
          </p>
        )}
      </div>
    </div>
  );
}
