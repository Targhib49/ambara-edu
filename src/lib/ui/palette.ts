// Shared muted badge palette + initials helper, used anywhere a track,
// student, or person needs a colored identity badge (dashboard, list rows).
export const BADGE_PALETTE = [
  "bg-teal-50 text-teal-700",
  "bg-indigo-50 text-indigo-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-emerald-50 text-emerald-700",
  "bg-violet-50 text-violet-700",
];

export function badgeColorFor(index: number) {
  return BADGE_PALETTE[index % BADGE_PALETTE.length];
}

/** Deterministic color from a string (e.g. a person's name) — same person, same color, everywhere. */
export function badgeColorForKey(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return BADGE_PALETTE[Math.abs(hash) % BADGE_PALETTE.length];
}

export function initialsFor(name: string) {
  const letters = name.match(/[A-Za-z]+/g) ?? [];
  return letters
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
