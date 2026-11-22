"use client";

import { useEffect, useMemo, useState } from "react";
import type { BoardPdfOption } from "@/app/api/board/[sessionId]/pdfs/route";
import type { PdfPages } from "./pdfPages";
import { useT } from "@/lib/i18n/client";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

/** More than this in one go is almost certainly a mis-click on a whole book. */
const MAX_INSERT = 60;
/** Rows shown before the search has to narrow it down. */
const MAX_ROWS = 40;

/**
 * The tutor's "Insert PDF" dialog: find a lesson PDF, pick which of its pages,
 * and they go onto the board after the current page.
 */
export function PdfPicker({
  sessionId,
  pdfs,
  onClose,
  onInsert,
}: {
  sessionId: string;
  pdfs: PdfPages;
  onClose: () => void;
  onInsert: (option: BoardPdfOption, aspects: number[], from: number, to: number) => void;
}) {
  const t = useT();
  const [options, setOptions] = useState<BoardPdfOption[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<BoardPdfOption | null>(null);
  const [aspects, setAspects] = useState<number[] | null>(null);
  const [describeError, setDescribeError] = useState(false);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/board/${sessionId}/pdfs`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body: { options: BoardPdfOption[] }) => {
        if (!cancelled) setOptions(body.options);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choose = (option: BoardPdfOption) => {
    setChosen(option);
    setAspects(null);
    setDescribeError(false);
    pdfs
      .describe(option.blockId)
      .then((list) => {
        setAspects(list);
        setFrom(1);
        setTo(Math.min(list.length, MAX_INSERT));
      })
      .catch(() => setDescribeError(true));
  };

  const filtered = useMemo(() => {
    if (!options) return [];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return options.filter((o) => {
      const hay = `${o.fileName} ${o.lesson} ${o.chapter} ${o.course}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [options, query]);

  const count = aspects?.length ?? 0;
  const validRange = aspects !== null && from >= 1 && to <= count && from <= to && to - from + 1 <= MAX_INSERT;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("board.insertPdf")}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-white shadow-xl sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">{t("board.insertPdf")}</h2>
          <button type="button" onClick={onClose} aria-label={t("action.cancel")} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {chosen ? (
          <div className="space-y-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{chosen.fileName}</p>
              <p className="truncate text-xs text-zinc-500">
                {chosen.course} › {chosen.chapter} › {chosen.lesson}
              </p>
            </div>
            {describeError ? (
              <p className="text-sm text-red-600">{t("board.pdfFailed")}</p>
            ) : aspects === null ? (
              <p className="text-sm text-zinc-500">{t("board.pdfLoading")}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-zinc-700">{t("board.pdfPageCount", { n: count })}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
                  <label className="flex items-center gap-1.5">
                    {t("board.pdfFrom")}
                    <input
                      type="number"
                      min={1}
                      max={count}
                      value={from}
                      onChange={(e) => setFrom(Number(e.target.value))}
                      className="w-20 rounded-md border border-zinc-300 px-2 py-1"
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    {t("board.pdfTo")}
                    <input
                      type="number"
                      min={1}
                      max={count}
                      value={to}
                      onChange={(e) => setTo(Number(e.target.value))}
                      className="w-20 rounded-md border border-zinc-300 px-2 py-1"
                    />
                  </label>
                </div>
                {!validRange && <p className="text-xs text-red-600">{t("board.pdfRangeInvalid", { max: MAX_INSERT })}</p>}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChosen(null)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                {t("board.pdfBack")}
              </button>
              <button
                type="button"
                disabled={!validRange}
                onClick={() => aspects && onInsert(chosen, aspects, from, to)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
              >
                {t("board.pdfInsertPages", { n: validRange ? to - from + 1 : 0 })}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-zinc-200 p-3">
              <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <SearchIcon className="h-4 w-4 text-zinc-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("board.pdfSearch")}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadError ? (
                <p className="p-4 text-sm text-red-600">{t("board.pdfListFailed")}</p>
              ) : options === null ? (
                <p className="p-4 text-sm text-zinc-500">{t("board.pdfLoading")}</p>
              ) : filtered.length === 0 ? (
                <p className="p-4 text-sm text-zinc-500">{t("board.pdfNone")}</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {filtered.slice(0, MAX_ROWS).map((o) => (
                    <li key={o.blockId}>
                      <button type="button" onClick={() => choose(o)} className="w-full px-4 py-2.5 text-left hover:bg-zinc-50">
                        <p className="flex items-center gap-2 truncate text-sm font-medium text-zinc-900">
                          <span className="truncate">{o.fileName}</span>
                          {o.thisCourse && (
                            <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                              {t("board.pdfThisCourse")}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {o.course} › {o.chapter} › {o.lesson}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {filtered.length > MAX_ROWS && (
                <p className="px-4 py-2 text-xs text-zinc-500">{t("board.pdfMore", { n: filtered.length - MAX_ROWS })}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
