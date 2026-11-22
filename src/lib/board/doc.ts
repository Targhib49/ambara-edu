/**
 * The shared whiteboard document, and the messages clients exchange about it.
 *
 * Everything is append-only: a stroke, once drawn, is never edited — erasing
 * adds its id to `deleted`, and undoing an erase re-adds a copy under a new
 * id. That makes merging two snapshots a plain union, so the tutor's and the
 * student's saves (or a late joiner's sync) can never undo each other's work,
 * whatever order they arrive in.
 */
import { z } from "zod";

/** Logical page size. Strokes are stored in these units, whatever the screen. */
export const PAGE_W = 1600;
export const PAGE_H = 1000;

/** [x, y, pressure 0..1] in page units. */
export type Point = [number, number, number];

export type Tool = "pen" | "highlighter";

export type Stroke = {
  id: string;
  page: string;
  author: string;
  tool: Tool;
  color: string;
  size: number;
  points: Point[];
};

/**
 * What a page is drawn on, under the ink. A PDF page is laid out to fill the
 * page's height from the left edge, so a portrait page leaves a wide writing
 * margin on its right. A `crop` (from the snip tool) is a region of that PDF
 * page, as fractions of its width and height, shown small in the top-left
 * corner of an otherwise empty page — room to work the problem out.
 */
export type PdfBackground = {
  kind: "pdf";
  blockId: string;
  /** 1-based page number in the PDF. */
  page: number;
  /** File name, for the page label. */
  name: string;
  /** Width / height of what is shown (the crop, if there is one). */
  aspect: number;
  crop?: [number, number, number, number];
};

/**
 * A practice question the student shared from a quiz, as it stood when they
 * pressed "Ask tutor": the question without its answer, and what they had
 * answered so far. A snapshot, not a link — the board never needs to load or
 * check quiz data, and it reads the same later as notes.
 */
export type QuestionBackground = {
  kind: "question";
  /** Quiz title and question number, for the card header. */
  title: string;
  /** Text with $…$ maths, as MathText renders it. */
  prompt: string;
  /** Choices in the order the student saw them, already lettered ("A. …"). */
  choices: string[];
  /** Steps, parts or solution lines, already labelled. */
  items: string[];
  /** The student's answer so far, one line each; empty if they hadn't started. */
  answer: string[];
  /** Show the answer as code. */
  code: boolean;
};

export type PageBackground = PdfBackground | QuestionBackground;

export type BoardDoc = {
  pages: string[];
  strokes: Record<string, Stroke>;
  deleted: string[];
  /** By page id. Set once when the page is made and never changed. */
  backgrounds: Record<string, PageBackground>;
  /** Pages someone deleted. Tombstoned like strokes, so a merge can't bring them back. */
  removedPages: string[];
};

// Generous caps: a dense hour of writing is a few hundred strokes. They stop a
// broken or hostile client from filling the row, not real use.
// 300 pages: a few whole PDFs inserted into one board.
const MAX_PAGES = 300;
const MAX_STROKES = 20_000;
const MAX_POINTS = 4_000;

const pointSchema = z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]);
export const strokeSchema = z.object({
  id: z.string().min(1).max(64),
  page: z.string().min(1).max(64),
  author: z.string().max(64),
  tool: z.enum(["pen", "highlighter"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  size: z.number().min(0.5).max(80),
  points: z.array(pointSchema).max(MAX_POINTS),
});
const fraction = z.number().min(0).max(1);
export const pdfBackgroundSchema = z.object({
  kind: z.literal("pdf"),
  blockId: z.string().regex(/^[0-9a-f-]{36}$/i),
  page: z.number().int().min(1).max(10_000),
  name: z.string().max(300),
  aspect: z.number().min(0.05).max(20),
  crop: z.tuple([fraction, fraction, fraction, fraction]).optional(),
});
const shortText = z.string().max(4000);
export const questionBackgroundSchema = z.object({
  kind: z.literal("question"),
  title: z.string().max(300),
  prompt: z.string().max(8000),
  choices: z.array(shortText).max(12),
  items: z.array(shortText).max(30),
  answer: z.array(z.string().max(20_000)).max(30),
  code: z.boolean(),
});
export const pageBackgroundSchema = z.discriminatedUnion("kind", [pdfBackgroundSchema, questionBackgroundSchema]);
export const boardDocSchema = z.object({
  pages: z.array(z.string().min(1).max(64)).min(1).max(MAX_PAGES),
  strokes: z.record(z.string(), strokeSchema),
  deleted: z.array(z.string().max(64)).max(MAX_STROKES * 2),
  // Defaults: boards saved before PDF pages existed have neither.
  backgrounds: z.record(z.string(), pageBackgroundSchema).default({}),
  removedPages: z.array(z.string().max(64)).max(MAX_PAGES * 10).default([]),
});

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function emptyDoc(): BoardDoc {
  return { pages: [newId()], strokes: {}, deleted: [], backgrounds: {}, removedPages: [] };
}

/**
 * Union of two snapshots. Pages keep `a`'s order with `b`'s extras appended;
 * a stroke present in both keeps the longer copy (one side may have saved it
 * mid-draw); anything either side erased stays erased.
 */
export function mergeDocs(a: BoardDoc, b: BoardDoc): BoardDoc {
  const removedPages = Array.from(new Set([...a.removedPages, ...b.removedPages]));
  const removed = new Set(removedPages);
  const order = [...a.pages];
  for (const p of b.pages) if (!order.includes(p)) order.push(p);
  let pages = order.filter((p) => !removed.has(p));
  // Never end with no pages at all: both sides deleted everything they had.
  if (pages.length === 0) pages = [newId()];
  const backgrounds = { ...b.backgrounds, ...a.backgrounds };
  const deleted = Array.from(new Set([...a.deleted, ...b.deleted]));
  const gone = new Set(deleted);
  const strokes: Record<string, Stroke> = {};
  for (const s of [...Object.values(a.strokes), ...Object.values(b.strokes)]) {
    if (gone.has(s.id)) continue;
    const prev = strokes[s.id];
    if (!prev || s.points.length > prev.points.length) strokes[s.id] = s;
  }
  return {
    pages: pages.slice(0, MAX_PAGES),
    strokes: Object.fromEntries(Object.entries(strokes).slice(0, MAX_STROKES)),
    deleted,
    backgrounds,
    removedPages,
  };
}

/** Reads a stored doc, falling back to a fresh board if the row is unreadable. */
export function parseDoc(value: unknown): BoardDoc {
  const parsed = boardDocSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyDoc();
}

export type Rect = { x: number; y: number; w: number; h: number };

/** The question card's box: the left part of the page, the rest left for working. */
export const QUESTION_CARD: Rect = { x: 0, y: 0, w: 860, h: PAGE_H };

/** Where a page's background sits, in page units. See PdfBackground. */
export function backgroundRect(bg: PageBackground): Rect {
  if (bg.kind === "question") return QUESTION_CARD;
  if (bg.crop) {
    // A snip: as large as fits a corner box, never upscaled past it.
    const maxW = 860;
    const maxH = 560;
    const w = Math.min(maxW, maxH * bg.aspect);
    return { x: 40, y: 40, w, h: w / bg.aspect };
  }
  const h = Math.min(PAGE_H, PAGE_W / bg.aspect);
  return { x: 0, y: 0, w: h * bg.aspect, h };
}

/** Rounds to 0.1 page unit: invisible on screen, and halves the payload. */
export function roundPoint(x: number, y: number, p: number): Point {
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(p * 100) / 100];
}

// --- realtime messages -------------------------------------------------------

/** Broadcast events on the "board:<sessionId>" channel. */
export type BoardEvent =
  | { type: "stroke-begin"; stroke: Stroke }
  | { type: "stroke-points"; id: string; points: Point[] }
  | { type: "add-strokes"; strokes: Stroke[] }
  | { type: "erase"; ids: string[] }
  | { type: "pages-add"; after: string | null; pages: { id: string; background?: PageBackground }[] }
  | { type: "page-remove"; id: string }
  | { type: "page-go"; id: string }
  | { type: "cursor"; page: string; x: number; y: number }
  | { type: "cursor-leave" }
  // Catching up after a join or reconnect goes through the database rather than
  // the channel (a whole board can pass Realtime's message size limit): the
  // newcomer saves and asks; everyone else saves, reloads, and answers "saved";
  // the newcomer reloads. Both sides end with the union.
  | { type: "sync-request" }
  | { type: "saved" };

/** What actually goes over the wire: the event plus who sent it. */
export type BoardMessage = BoardEvent & { from: string };

export type PresenceState = { userId: string; name: string; role: "TUTOR" | "STUDENT"; color: string };
