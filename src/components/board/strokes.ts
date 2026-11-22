import { getStroke } from "perfect-freehand";
import { PAGE_H, PAGE_W, type Stroke } from "@/lib/board/doc";

/** Mouse and touch report no real pressure; their points carry exactly this. */
export const NO_PRESSURE = 0.5;

const HIGHLIGHTER_ALPHA = 0.35;

function svgPath(outline: number[][]): string {
  if (outline.length < 4) return "";
  const avg = (a: number, b: number) => (a + b) / 2;
  let a = outline[0];
  let b = outline[1];
  const c = outline[2];
  let d = `M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${b[0].toFixed(1)},${b[1].toFixed(1)} ${avg(b[0], c[0]).toFixed(1)},${avg(b[1], c[1]).toFixed(1)} T`;
  for (let i = 2; i < outline.length - 1; i++) {
    a = outline[i];
    b = outline[i + 1];
    d += `${avg(a[0], b[0]).toFixed(1)},${avg(a[1], b[1]).toFixed(1)} `;
  }
  return d + "Z";
}

/**
 * Path2D per stroke, rebuilt only when the stroke grows. Finished strokes are
 * never touched again, so a full redraw costs one fill() per stroke.
 */
export class StrokeCache {
  private cache = new Map<string, { len: number; path: Path2D }>();

  path(stroke: Stroke): Path2D {
    const hit = this.cache.get(stroke.id);
    if (hit && hit.len === stroke.points.length) return hit.path;
    const simulate = stroke.points.every((p) => p[2] === NO_PRESSURE);
    const outline = getStroke(stroke.points, {
      size: stroke.size,
      thinning: stroke.tool === "pen" ? 0.55 : 0,
      smoothing: 0.5,
      streamline: 0.45,
      simulatePressure: simulate && stroke.tool === "pen",
      last: true,
    });
    const path = new Path2D(svgPath(outline));
    this.cache.set(stroke.id, { len: stroke.points.length, path });
    return path;
  }

  forget(id: string) {
    this.cache.delete(id);
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  // Dot grid: enough to keep handwriting and diagrams level, quiet enough to ignore.
  ctx.fillStyle = "#d4d4d8";
  const step = 40;
  for (let x = step; x < PAGE_W; x += step) {
    for (let y = step; y < PAGE_H; y += step) {
      ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    }
  }
}

export function drawStroke(ctx: CanvasRenderingContext2D, cache: StrokeCache, stroke: Stroke) {
  if (stroke.points.length === 0) return;
  ctx.globalAlpha = stroke.tool === "highlighter" ? HIGHLIGHTER_ALPHA : 1;
  ctx.fillStyle = stroke.color;
  if (stroke.points.length === 1) {
    // A tap: perfect-freehand needs movement, so draw the dot ourselves.
    const [x, y] = stroke.points[0];
    ctx.beginPath();
    ctx.arc(x, y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fill(cache.path(stroke));
  }
  ctx.globalAlpha = 1;
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Whether an eraser of `radius` at (x, y) touches the stroke. */
export function hitsStroke(stroke: Stroke, x: number, y: number, radius: number) {
  const reach = radius + stroke.size / 2;
  const pts = stroke.points;
  if (pts.length === 1) return Math.hypot(pts[0][0] - x, pts[0][1] - y) <= reach;
  for (let i = 1; i < pts.length; i++) {
    if (distToSegment(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) <= reach) return true;
  }
  return false;
}
