import type { PdfBackground } from "@/lib/board/doc";

/**
 * Loads board PDFs with pdf.js and renders their pages to bitmaps for the
 * board canvas to draw under the ink. Each page is rendered once per size
 * bucket and kept; a board rarely holds more than a few dozen PDF pages.
 */

type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
  cleanup: () => void;
};
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<PdfPage>; destroy: () => Promise<void> };

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    try {
      pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL("../blocks/pdfWorker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      pdfjs.GlobalWorkerOptions.workerPort = null;
    }
    return pdfjs;
  });
  return pdfjsPromise;
}

/** Largest bitmap edge we render: sharp on a retina tablet, bounded in memory. */
const MAX_BITMAP_EDGE = 3200;

export class PdfPages {
  private docs = new Map<string, Promise<PdfDoc>>();
  private bitmaps = new Map<string, HTMLCanvasElement>();
  private pending = new Set<string>();
  private failed = new Set<string>();

  private listeners = new Set<() => void>();

  /** Called when a bitmap lands or fails, so the board redraws. Returns the unsubscribe. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private onReady() {
    for (const l of this.listeners) l();
  }

  constructor(private urlFor: (blockId: string) => string) {}

  doc(blockId: string): Promise<PdfDoc> {
    let doc = this.docs.get(blockId);
    if (!doc) {
      doc = loadPdfJs().then((pdfjs) => pdfjs.getDocument({ url: this.urlFor(blockId) }).promise as unknown as Promise<PdfDoc>);
      // Forget a failed load so a later request (e.g. once the file is shared) retries.
      doc.catch(() => this.docs.delete(blockId));
      this.docs.set(blockId, doc);
    }
    return doc;
  }

  /** Page count and each page's width/height ratio, for inserting a PDF. */
  async describe(blockId: string): Promise<number[]> {
    const doc = await this.doc(blockId);
    const aspects: number[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const v = page.getViewport({ scale: 1 });
      aspects.push(v.width / v.height);
      page.cleanup();
    }
    return aspects;
  }

  /**
   * The full PDF page as a bitmap at least `width` device pixels wide, or null
   * while it renders (onReady fires when it lands). Widths are bucketed so a
   * resize doesn't re-render every page.
   */
  bitmap(bg: PdfBackground, width: number): HTMLCanvasElement | null {
    const bucket = Math.min(MAX_BITMAP_EDGE, Math.max(400, Math.ceil(width / 400) * 400));
    const key = `${bg.blockId}:${bg.page}:${bucket}`;
    const hit = this.bitmaps.get(key);
    if (hit) return hit;
    if (this.failed.has(key)) return this.closest(bg) ?? null;
    if (!this.pending.has(key)) {
      this.pending.add(key);
      void this.render(bg, bucket, key);
    }
    // Meanwhile, any size of the same page beats a blank box.
    return this.closest(bg);
  }

  isFailed(bg: PdfBackground): boolean {
    return [...this.failed].some((k) => k.startsWith(`${bg.blockId}:${bg.page}:`));
  }

  private closest(bg: PdfBackground): HTMLCanvasElement | null {
    const prefix = `${bg.blockId}:${bg.page}:`;
    let best: HTMLCanvasElement | null = null;
    for (const [k, c] of this.bitmaps) if (k.startsWith(prefix) && (!best || c.width > best.width)) best = c;
    return best;
  }

  private async render(bg: PdfBackground, width: number, key: string) {
    try {
      const doc = await this.doc(bg.blockId);
      const page = await doc.getPage(bg.page);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(width / base.width, MAX_BITMAP_EDGE / base.height);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();
      this.bitmaps.set(key, canvas);
    } catch {
      this.failed.add(key);
    } finally {
      this.pending.delete(key);
      this.onReady();
    }
  }

  /** Clears failures so the next draw retries (after a sync may have shared the file). */
  retryFailed() {
    if (this.failed.size === 0) return;
    this.failed.clear();
    this.onReady();
  }
}
