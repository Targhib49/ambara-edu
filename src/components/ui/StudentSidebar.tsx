"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createCollapsibleStore } from "@/lib/ui/collapsibleStore";
import { BookIcon, CalendarIcon, ChevronLeftIcon, ClipboardIcon, HomeIcon } from "@/components/ui/icons";

const { useOpen, setOpen } = createCollapsibleStore("lms:studentNavOpen");

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/tracks", label: "My tracks", icon: BookIcon },
  { href: "/quizzes", label: "Quizzes", icon: ClipboardIcon },
  { href: "/sessions", label: "My sessions", icon: CalendarIcon },
] as const;

// Mirrors TutorSidebar's structure exactly, so both roles share one visual
// shell language — same collapse behavior, same icon-rail-only mobile rule.
export function StudentSidebar() {
  const pathname = usePathname();
  const open = useOpen();

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col bg-slate-900 transition-[width] duration-200 ${
        open ? "w-16 lg:w-56" : "w-16"
      }`}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="text-lg font-bold text-white">
          <span className={open ? "lg:hidden" : ""}>AE</span>
          {open && <span className="hidden lg:inline">AmbaraEdu</span>}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm ${
                active
                  ? "border-blue-400 bg-white/10 font-medium text-white"
                  : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {open && <span className="hidden truncate lg:inline">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className="hidden h-10 items-center justify-center border-t border-white/10 text-slate-400 hover:bg-white/5 hover:text-white lg:flex"
      >
        <ChevronLeftIcon className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
}
