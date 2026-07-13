/**
 * Shared loading indicator for route-level loading.tsx boundaries. Pure
 * markup (server-safe) — the animation is CSS-only, so it keeps spinning
 * even while the network is stalled.
 */
export function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-zinc-200 border-t-blue-600"
      />
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
