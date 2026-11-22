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

export type BoardDoc = {
  pages: string[];
  strokes: Record<string, Stroke>;
  deleted: string[];
};

// Generous caps: a dense hour of writing is a few hundred strokes. They stop a
// broken or hostile client from filling the row, not real use.
const MAX_PAGES = 100;
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
export const boardDocSchema = z.object({
  pages: z.array(z.string().min(1).max(64)).min(1).max(MAX_PAGES),
  strokes: z.record(z.string(), strokeSchema),
  deleted: z.array(z.string().max(64)).max(MAX_STROKES * 2),
});

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function emptyDoc(): BoardDoc {
  return { pages: [newId()], strokes: {}, deleted: [] };
}

/**
 * Union of two snapshots. Pages keep `a`'s order with `b`'s extras appended;
 * a stroke present in both keeps the longer copy (one side may have saved it
 * mid-draw); anything either side erased stays erased.
 */
export function mergeDocs(a: BoardDoc, b: BoardDoc): BoardDoc {
  const pages = [...a.pages];
  for (const p of b.pages) if (!pages.includes(p)) pages.push(p);
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
  };
}

/** Reads a stored doc, falling back to a fresh board if the row is unreadable. */
export function parseDoc(value: unknown): BoardDoc {
  const parsed = boardDocSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyDoc();
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
  | { type: "page-add"; id: string; after: string | null }
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
