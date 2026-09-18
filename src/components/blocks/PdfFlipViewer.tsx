"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

/**
 * A PDF read like a book instead of a scroll: one whole page in view at a time,
 * flipped with the arrows, the keyboard or a swipe.
 *
 * The shape of page one decides the layout, so nothing has to be set per file:
 * landscape pages are slides (one at a time, as wide as the column), portrait
 * pages are a book — a two-page spread on a wide screen, a single page on a
 * narrow one, with page 1 alone as the cover so the spreads fall 2-3, 4-5, …
 *
 * Pages are drawn to a canvas by pdf.js in a worker, which is what makes the
 * page fit the box exactly; the old iframe could only scroll the browser's own
 * viewer, and on iOS it showed page one and stopped.
 */

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};
type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void>; cancel: () => void };
  cleanup: () => void;
};

/** Widest the reader goes; past this a spread's text is larger than it needs to be. */
const MAX_SPREAD_WIDTH = 1400;
/** Below this the reader is too narrow for two readable pages side by side. */
const SPREAD_MIN_WIDTH = 720;
/** Leaves room for the page's own chrome and the app header. */
const MAX_HEIGHT_RATIO = 0.82;
/** In fullscreen only the controls share the screen with the page. */
const FULLSCREEN_HEIGHT_RATIO = 0.86;

export function PdfFlipViewer({ blockId, fileName }: { blockId: string; fileName: string }) {
  const t = useT();
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [aspect, setAspect] = useState<number | null>(null); // width / height of page 1
  const [wide, setWide] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Landscape pages are a deck; portrait pages are a book.
  const isSlides = aspect !== null && aspect > 1;
  const spread = !isSlides && wide && numPages > 1;

  useEffect(() => {
    let cancelled = false;
    let loaded: PdfDoc | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        try {
          // Keeps rendering off the main thread. If the worker can't start,
          // pdf.js falls back to drawing inline — slower, but it still reads.
          pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL("./pdfWorker.ts", import.meta.url), {
            type: "module",
          });
        } catch {
          pdfjs.GlobalWorkerOptions.workerPort = null;
        }
        const task = pdfjs.getDocument({ url: `/api/files/${blockId}?inline=1` });
        const pdf = (await task.promise) as unknown as PdfDoc;
        if (cancelled) {
          await pdf.destroy();
          return;
        }
        loaded = pdf;
        const first = await pdf.getPage(1);
        const view = first.getViewport({ scale: 1 });
        first.cleanup();
        if (cancelled) return;
        setAspect(view.width / view.height);
        setNumPages(pdf.numPages);
        setDoc(pdf);
      } catch {
        if (!cancelled) setError(t("pdf.loadFailed"));
      }
    })();
    return () => {
      cancelled = true;
      void loaded?.destroy();
    };
  }, [blockId, t]);

  // A spread needs room for two pages side by side. What matters is the width
  // of the reader itself, not the window: inside a lesson column a spread would
  // be two thumbnails, while in fullscreen even a phone has room.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setWide(frame.clientWidth >= SPREAD_MIN_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // "Fullscreen" is an overlay of our own rather than the Fullscreen API: iOS
  // Safari won't put an element fullscreen at all, and a deck that only fills
  // the screen on some devices is worse than one that always behaves the same.
  // While it's on, the page behind must not scroll under the overlay.
  useEffect(() => {
    if (!fullscreen) return;
    frameRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [fullscreen]);

  // Spreads run 1 | 2-3 | 4-5 …, so the left page of a spread is always even.
  const leftPage = spread && page > 1 ? (page % 2 === 0 ? page : page - 1) : page;
  const visible = useMemo(() => {
    if (!spread || leftPage === 1) return [leftPage];
    return leftPage + 1 <= numPages ? [leftPage, leftPage + 1] : [leftPage];
  }, [spread, leftPage, numPages]);

  const canPrev = leftPage > 1;
  const canNext = visible[visible.length - 1] < numPages;
  const goPrev = useCallback(() => {
    setPage((p) => {
      const left = spread && p > 1 ? (p % 2 === 0 ? p : p - 1) : p;
      return Math.max(1, left - (spread && left > 2 ? 2 : 1));
    });
  }, [spread]);
  const goNext = useCallback(() => {
    setPage((p) => {
      const left = spread && p > 1 ? (p % 2 === 0 ? p : p - 1) : p;
      return Math.min(numPages, left + (spread ? (left === 1 ? 1 : 2) : 1));
    });
  }, [spread, numPages]);

  // Arrow keys work while the reader has focus, so they don't steal the page's
  // own scrolling when the student is reading something else.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && fullscreen) {
      e.preventDefault();
      setFullscreen(false);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      goNext();
    }
  };

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    // Ignore a mostly-vertical drag: that's the student scrolling the lesson.
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(touch.clientY - start.y)) return;
    if (dx > 0) goPrev();
    else goNext();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 bg-zinc-50 px-4 py-8 text-sm text-zinc-600">
        <p>{error}</p>
        <a
          href={`/api/files/${blockId}?inline=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-700"
        >
          {t("pdf.openTab")}
        </a>
      </div>
    );
  }

  return (
    <div
      ref={frameRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={fileName}
      className={`flex flex-col items-center gap-3 px-2 py-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-4 ${
        fullscreen ? "fixed inset-0 z-50 h-dvh w-screen justify-center bg-zinc-900 sm:px-8" : "relative bg-zinc-100"
      }`}
    >
      {!doc && <div className="flex h-64 items-center text-sm text-zinc-500">{t("pdf.loading")}</div>}

      {doc && aspect !== null && (
        <>
          <div
            className="flex w-full items-start justify-center gap-1 sm:gap-2"
            style={{
              maxWidth: fullscreen ? "100%" : `${Math.min(MAX_SPREAD_WIDTH, 900 * visible.length)}px`,
            }}
          >
            {visible.map((n) => (
              <PageCanvas
                key={n}
                doc={doc}
                pageNumber={n}
                aspect={aspect}
                pagesAcross={visible.length}
                zoomed={zoomed}
                heightRatio={fullscreen ? FULLSCREEN_HEIGHT_RATIO : MAX_HEIGHT_RATIO}
              />
            ))}
          </div>

          <div className="flex w-full max-w-md items-center justify-center gap-3 text-sm">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label={t("pdf.previous")}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              ←
            </button>
            <span className="min-w-28 text-center tabular-nums text-zinc-600">
              {visible.length > 1
                ? t("pdf.pagesOf", { a: visible[0], b: visible[1], total: numPages })
                : t("pdf.pageOf", { n: visible[0], total: numPages })}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label={t("pdf.next")}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              →
            </button>
            {/* A page that fits the screen can still be small on a laptop, so
                one tap makes it as wide as the column instead. */}
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="ml-1 hidden rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 sm:inline-block"
            >
              {zoomed ? t("pdf.fitPage") : t("pdf.fitWidth")}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((f) => !f)}
              title={t(fullscreen ? "pdf.exitFullscreen" : "pdf.fullscreen")}
              aria-label={t(fullscreen ? "pdf.exitFullscreen" : "pdf.fullscreen")}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              {fullscreen ? "\u2715" : "\u26f6"}
            </button>
          </div>
          <p className="hidden text-[11px] text-zinc-400 sm:block print:hidden">{t(isSlides ? "pdf.hintSlides" : "pdf.hintBook")}</p>
        </>
      )}
    </div>
  );
}

/**
 * One page, drawn at the size it will actually be shown (and at the screen's
 * pixel density, or the text turns fuzzy on a retina display).
 */
function PageCanvas({
  doc,
  pageNumber,
  aspect,
  pagesAcross,
  zoomed,
  heightRatio,
}: {
  doc: PdfDoc;
  pageNumber: number;
  aspect: number;
  pagesAcross: number;
  zoomed: boolean;
  heightRatio: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // The box is sized from the page's own shape so one whole page is in view;
  // its width follows whatever height is available, unless "fit width" is on.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const available = box.clientWidth;
      const byHeight = window.innerHeight * heightRatio * aspect;
      setWidth(Math.max(120, Math.floor(zoomed ? available : Math.min(available, byHeight))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [aspect, pagesAcross, zoomed, heightRatio]);

  useEffect(() => {
    if (!width) return;
    let cancelled = false;
    let task: { cancel: () => void } | null = null;
    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const render = page.render({ canvasContext: context, viewport });
      task = render;
      try {
        await render.promise;
      } catch {
        // A flip mid-render cancels this one; the next page draws instead.
      }
      page.cleanup();
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, width]);

  return (
    <div ref={boxRef} className="flex min-w-0 flex-1 justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: width ? `${width}px` : "100%", aspectRatio: String(aspect) }}
        className="max-w-full rounded bg-white shadow-md"
      />
    </div>
  );
}
