/**
 * Whether a page navigation the user started is still loading.
 *
 * The app renders pages on the server, so after clicking a link there can be a
 * second or two before anything changes. The progress bar reads this store:
 * a navigation counts as in flight while the browser is still on the URL it
 * started from. Arriving anywhere else ends it without any extra bookkeeping.
 */

let startedFrom: string | null = null;
let timeout: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Normalised so it compares equal to what usePathname/useSearchParams report. */
export function urlKey(pathname: string, search: string) {
  const query = new URLSearchParams(search).toString();
  return query ? `${pathname}?${query}` : pathname;
}

function clear() {
  if (startedFrom === null) return;
  startedFrom = null;
  emit();
}

/** Call just before navigating somewhere. Ignores links to the current page and to other sites. */
export function startNavigation(href: string) {
  if (typeof window === "undefined") return;
  const target = new URL(href, window.location.href);
  if (target.origin !== window.location.origin) return;
  const here = urlKey(window.location.pathname, window.location.search);
  if (urlKey(target.pathname, target.search) === here) return;

  startedFrom = here;
  emit();
  // A navigation that never lands (offline, an error page that keeps the URL)
  // must not leave the bar up forever.
  clearTimeout(timeout);
  timeout = setTimeout(clear, 15_000);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  // Back/forward can return to the URL a navigation started from.
  if (listeners.size === 1) window.addEventListener("popstate", clear);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", clear);
  };
}

export function getSnapshot() {
  return startedFrom;
}

export function getServerSnapshot() {
  return null;
}
