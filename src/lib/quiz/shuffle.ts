/**
 * A permutation of 0..n-1 that depends only on `seed`: the same seed always
 * gives the same order. Used to shuffle answer options per attempt without
 * storing the order — seeded with the attempt's id, a reload shows the same
 * order, and the next attempt (a new id) gets a fresh one.
 */
export function seededPermutation(seed: string, n: number): number[] {
  // FNV-1a to turn the seed into 32 bits, then mulberry32 as the generator.
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
