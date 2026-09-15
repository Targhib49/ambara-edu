"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getServerSnapshot, getSnapshot, startNavigation, subscribe, urlKey } from "@/lib/ui/navigationProgress";

/**
 * A thin bar across the top of the window while a page is loading after a
 * click, plus a "working" cursor — so a click on a link, tab or table row
 * always visibly does something, however long the server takes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startedFrom = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // Capture phase: next/link calls preventDefault in its own handler, so a
    // bubbling listener would never see those clicks.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      startNavigation(anchor.href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const active = startedFrom !== null && startedFrom === urlKey(pathname, searchParams.toString());

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        {active && (
          <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)] [animation:nav-progress_10s_cubic-bezier(0.1,0.7,0.2,1)_forwards]" />
        )}
      </div>
      {active && <style>{"html{cursor:progress}"}</style>}
    </>
  );
}
