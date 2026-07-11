import { useSyncExternalStore } from "react";

/**
 * localStorage-backed open/closed flag for a collapsible panel.
 * useSyncExternalStore resyncs the real value right after hydration, before
 * paint, so there's no flash-then-snap when a collapsed state is restored.
 * Shared by every collapsible sidebar in the app — each needs its own
 * storage key so their states don't leak into each other.
 */
export function createCollapsibleStore(storageKey: string, defaultOpen = true) {
  let cached: boolean | null = null;
  const listeners = new Set<() => void>();

  function getSnapshot() {
    if (cached === null) {
      const stored = localStorage.getItem(storageKey);
      cached = stored === null ? defaultOpen : stored === "true";
    }
    return cached;
  }

  function getServerSnapshot() {
    return defaultOpen;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setOpen(next: boolean) {
    cached = next;
    localStorage.setItem(storageKey, String(next));
    listeners.forEach((l) => l());
  }

  function useOpen() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  return { useOpen, setOpen };
}
