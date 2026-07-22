import { useSyncExternalStore } from "react";

/**
 * In-memory (non-persisted) open/closed flag for the mobile nav drawer —
 * unlike collapsibleStore's desktop expand/collapse preference, this should
 * always start closed on a fresh page load. Shared by both role shells:
 * only one role is ever active per session, so one instance is enough.
 */
function createMobileNavStore() {
  let open = false;
  const listeners = new Set<() => void>();

  function getSnapshot() {
    return open;
  }

  function getServerSnapshot() {
    return false;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setOpen(next: boolean) {
    open = next;
    listeners.forEach((l) => l());
  }

  function useOpen() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  return { useOpen, setOpen };
}

export const mobileNav = createMobileNavStore();
