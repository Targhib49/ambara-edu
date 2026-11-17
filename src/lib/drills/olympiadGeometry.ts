import { drillInt, type DrillQuestion, type Rand } from "@/lib/drills/types";

/**
 * Geometry drills for the olympiad course's Geometri levels: Pythagorean
 * triples and the angles of regular polygons.
 */

const pick = <T,>(rand: Rand, items: readonly T[]): T => items[drillInt(rand, 0, items.length - 1)];

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
] as const;

/** "Siku-siku 9 dan 12, miring …", or the missing leg: "Miring 13, siku 5, siku lain …". */
export function makePythagorasQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const [a, b, c] = pick(rand, TRIPLES.slice(0, hard ? 5 : medium ? 4 : 2));
  const k = drillInt(rand, 1, hard ? 6 : medium ? 4 : 3);
  const [x, y] = rand() < 0.5 ? [a * k, b * k] : [b * k, a * k];
  if (medium && rand() < 0.5) return { prompt: `Miring ${c * k}, siku ${x}, siku lain …`, separator: "", answer: [y] };
  return { prompt: `Siku-siku ${x} dan ${y}, miring …`, separator: "", answer: [c * k] };
}

/** Regular polygons whose angles are whole degrees. */
const SIDES = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36] as const;

/** Interior angle of a regular n-gon, then the reverse, then the angle sum. */
export function makePolygonAnglesQuestion(index: number, rand: Rand): DrillQuestion {
  const hard = index >= 12;
  const medium = index >= 5;
  const n = pick(rand, SIDES.slice(0, hard ? SIDES.length : medium ? 10 : 6));
  const interior = 180 - 360 / n;
  const kind = hard ? drillInt(rand, 0, 2) : medium ? drillInt(rand, 0, 1) : 0;
  if (kind === 1) return { prompt: `Sudut dalam ${interior}°, segi-…`, separator: "", answer: [n] };
  if (kind === 2) return { prompt: `Jumlah sudut dalam segi-${n} = …°`, separator: "", answer: [(n - 2) * 180] };
  return { prompt: `Sudut dalam segi-${n} beraturan = …°`, separator: "", answer: [interior] };
}
