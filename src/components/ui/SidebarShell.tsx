"use client";

import { createCollapsibleStore } from "@/lib/ui/collapsibleStore";

const { useOpen, setOpen } = createCollapsibleStore("lms:sidebarOpen");

// Full-bleed sidebar layout: sidebar pinned to the viewport's left edge,
// sticky under the 3.5rem app header, collapsible to a slim rail.
// Desktop only — below lg the sidebar is hidden (pages keep their own back links).
export function SidebarShell({
  title,
  sidebar,
  children,
}: {
  title: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const open = useOpen();

  return (
    <div className="flex w-full flex-1 items-stretch">
      <aside
        className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 self-start overflow-y-auto border-r border-zinc-200 bg-white transition-[width] duration-200 lg:block ${
          open ? "w-72" : "w-11"
        }`}
      >
        {open ? (
          <div className="px-3 py-5">
            <div className="mb-3 flex items-center gap-1 pl-3">
              <p className="min-w-0 flex-1 truncate text-sm font-semibold" title={title}>
                {title}
              </p>
              <button
                onClick={() => setOpen(false)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                «
              </button>
            </div>
            {sidebar}
          </div>
        ) : (
          <div className="flex justify-center py-3">
            <button
              onClick={() => setOpen(true)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              »
            </button>
          </div>
        )}
      </aside>
      <div className="min-w-0 flex-1 px-4 py-8 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
