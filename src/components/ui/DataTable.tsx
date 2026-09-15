"use client";

/**
 * The shape every tutor list takes: state tabs that keep their counts while
 * you switch between them, free-text search, an optional date window, sortable
 * columns, a page at a time, and a CSV download of whatever the filters leave.
 *
 * Adapted from the list pattern in SCI-FMOS so every table here behaves the
 * same way instead of each screen inventing its own. Filtering runs in the
 * browser over rows the page already loaded — at this app's volume that is the
 * right trade; if a list outgrows it, narrowing moves to the server and this
 * interface need not change.
 */

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "@/components/ui/icons";

export type Column<T> = {
  key: string;
  /** Plain text so it doubles as the CSV header. Use "" for an actions column. */
  header: string;
  cell: (row: T) => ReactNode;
  /** Providing this makes the column sortable by what it returns. */
  sort?: (row: T) => string | number;
  /**
   * The value written to a CSV, where `cell` renders markup a file can't hold.
   * Falls back to `cell` when that is a bare string or number, then to `sort`.
   */
  text?: (row: T) => string | number | null | undefined;
  align?: "left" | "right";
  /** Extra classes on the cell — widths, wrapping, tabular figures. */
  className?: string;
};

export type Tab<T> = {
  key: string;
  label: string;
  match: (row: T) => boolean;
};

const control =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function downloadCsv(name: string, headers: string[], body: string[][]) {
  const escape = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = [headers, ...body].map((row) => row.map(escape).join(",")).join("\r\n");
  // BOM so Excel reads the file as UTF-8 and names like "Sesi 1 — Mengenal" survive.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  search,
  tabs,
  initialTab,
  dateOf,
  toolbar,
  actions,
  exportName,
  empty,
  pageSize = 25,
  minWidth = "720px",
  initialSort,
  expandedKey,
  renderExpanded,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Free-text box. `of` returns everything a row should be findable by. */
  search?: { placeholder: string; of: (row: T) => string };
  tabs?: Tab<T>[];
  initialTab?: string;
  /** Enables the date window. Return an ISO date, or null for undated rows. */
  dateOf?: (row: T) => string | null | undefined;
  /** Anything else for the filter bar. */
  toolbar?: ReactNode;
  /** The screen's one strong action, pinned to the end of the filter row. */
  actions?: ReactNode;
  /** Turns on the download button and names the file. */
  exportName?: string;
  empty: { title: string; hint?: string };
  pageSize?: number;
  minWidth?: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  /** The row currently opened in place, if the screen opens rows. */
  expandedKey?: string | null;
  renderExpanded?: (row: T) => ReactNode;
}) {
  const [tab, setTab] = useState(initialTab ?? tabs?.[0]?.key ?? "all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState(initialSort?.key ?? "");
  const [dir, setDir] = useState<"asc" | "desc">(initialSort?.dir ?? "asc");
  const [page, setPage] = useState(1);

  // Every filter change returns to page 1 in the handler itself rather than in
  // an effect — staying on page 7 of a filter with two results is
  // disorienting, and an effect would render the wrong page first.
  const changeTab = (key: string) => {
    setTab(key);
    setPage(1);
  };
  const changeQuery = (value: string) => {
    setQ(value);
    setPage(1);
  };
  const changeFrom = (value: string) => {
    setFrom(value);
    setPage(1);
  };
  const changeTo = (value: string) => {
    setTo(value);
    setPage(1);
  };

  // Everything except the tab. Counts are read off this, so a tab can say how
  // many rows it holds even while you're looking at a different one.
  const narrowed = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (needle && search && !search.of(r).toLowerCase().includes(needle)) return false;
      if (dateOf && (from || to)) {
        const d = dateOf(r)?.slice(0, 10);
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  }, [rows, q, search, dateOf, from, to]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const t of tabs ?? []) out[t.key] = narrowed.filter(t.match).length;
    return out;
  }, [narrowed, tabs]);

  const matching = useMemo(() => {
    const active = tabs?.find((t) => t.key === tab);
    return active ? narrowed.filter(active.match) : narrowed;
  }, [narrowed, tabs, tab]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return matching;
    const factor = dir === "asc" ? 1 : -1;
    return [...matching].sort((a, b) => {
      const x = col.sort!(a);
      const y = col.sort!(b);
      if (typeof x === "number" && typeof y === "number") return (x - y) * factor;
      return String(x).localeCompare(String(y)) * factor;
    });
  }, [matching, columns, sortKey, dir]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Clamp rather than reset: if rows disappear under the current page (a
  // deletion, say), show the last page that still exists.
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const shown = sorted.slice(start, start + pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir("asc");
    }
  };

  /* Every row the filters leave standing, not just the page on screen. */
  const exportRows = () => {
    if (!exportName) return;
    const cols = columns.filter((c) => c.header !== "");
    const body = sorted.map((row) =>
      cols.map((c) => {
        if (c.text) return String(c.text(row) ?? "");
        const rendered = c.cell(row);
        if (typeof rendered === "string" || typeof rendered === "number") return String(rendered);
        return c.sort ? String(c.sort(row)) : "";
      })
    );
    downloadCsv(exportName, cols.map((c) => c.header), body);
  };

  const hasFilterBar = Boolean(search || dateOf || toolbar || actions || exportName);

  return (
    <div className="space-y-3">
      {tabs && tabs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = tab === t.key;
            const n = counts[t.key];
            return (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                aria-pressed={active}
                className={`h-9 rounded-md px-3.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 tabular-nums ${active ? "text-white/60" : "text-zinc-400"}`}>{n}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {hasFilterBar && (
          <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center">
            {search && (
              <input
                type="search"
                value={q}
                onChange={(e) => changeQuery(e.target.value)}
                placeholder={search.placeholder}
                className={`${control} min-w-0 flex-1`}
              />
            )}
            {dateOf && (
              <div className="flex items-center gap-2">
                <input type="date" value={from} onChange={(e) => changeFrom(e.target.value)} className={control} aria-label="From date" />
                <span className="text-sm text-zinc-400">to</span>
                <input type="date" value={to} onChange={(e) => changeTo(e.target.value)} className={control} aria-label="To date" />
              </div>
            )}
            {toolbar}
            <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
              {exportName && (
                <button
                  onClick={exportRows}
                  disabled={sorted.length === 0}
                  title="Download CSV"
                  aria-label="Download CSV"
                  className="grid h-10 place-items-center rounded-md border border-zinc-300 px-3 text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <DownloadIcon className="h-[18px] w-[18px]" />
                </button>
              )}
              {actions}
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-zinc-700">
              {rows.length === 0 ? empty.title : "Nothing matches that."}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {rows.length === 0 ? empty.hint : "Try a different search, tab or date range."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth }}>
              <thead className="bg-zinc-50">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 ${
                        c.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {c.sort ? (
                        <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 uppercase hover:text-zinc-800">
                          {c.header}
                          <span className={sortKey === c.key ? "text-blue-600" : "text-transparent"} aria-hidden>
                            {dir === "asc" ? "↑" : "↓"}
                          </span>
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => {
                  const key = rowKey(row);
                  const open = expandedKey === key && renderExpanded;
                  return (
                    <tr key={key} className="border-t border-zinc-100 align-top hover:bg-zinc-50/70">
                      {open ? (
                        <td colSpan={columns.length} className="bg-zinc-50/70 p-4">
                          {/* Pinned to the left edge of the scroll area, so a panel opened from a
                              column scrolled into view on a narrow screen isn't half off-screen. */}
                          <div className="sticky left-4 max-w-[calc(100vw-3rem)]">{renderExpanded(row)}</div>
                        </td>
                      ) : (
                        columns.map((c) => (
                          <td
                            key={c.key}
                            className={`px-3 py-3 text-[13px] text-zinc-600 ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`}
                          >
                            {c.cell(row)}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {sorted.length > pageSize && (
          <div className="flex items-center justify-between gap-3 border-t border-zinc-200 p-4">
            <span className="text-xs tabular-nums text-zinc-500">
              {start + 1}–{Math.min(start + pageSize, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="grid h-9 place-items-center rounded-md border border-zinc-300 px-3 text-zinc-700 disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-xs tabular-nums text-zinc-500">
                {currentPage} / {pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pages, currentPage + 1))}
                disabled={currentPage >= pages}
                aria-label="Next page"
                className="grid h-9 place-items-center rounded-md border border-zinc-300 px-3 text-zinc-700 disabled:opacity-40"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
