"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createCollapsibleStore } from "@/lib/ui/collapsibleStore";
import { HomeIcon, BookIcon, ClipboardIcon, CalendarIcon, UsersIcon, ChevronLeftIcon } from "@/components/ui/icons";

const { useOpen, setOpen } = createCollapsibleStore("lms:tutorNavOpen");

const NAV_ITEMS = [
  { href: "/tutor", label: "Home", icon: HomeIcon, exact: true },
  { href: "/tutor/tracks", label: "Tracks", icon: BookIcon, exact: false },
  { href: "/tutor/quizzes", label: "Quizzes", icon: ClipboardIcon, exact: false },
  { href: "/tutor/sessions", label: "Sessions", icon: CalendarIcon, exact: false },
  { href: "/tutor/students", label: "Students", icon: UsersIcon, exact: false },
] as const;

export function TutorSidebar() {
  const pathname = usePathname();
  const open = useOpen();

  // Below the lg breakpoint the sidebar always renders as the compact icon
  // rail, regardless of the user's expand/collapse preference — there isn't
  // room for a 224px sidebar on a phone. The toggle only affects lg+ screens.
  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col bg-slate-900 transition-[width] duration-200 ${
        open ? "w-16 lg:w-56" : "w-16"
      }`}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="text-lg font-bold text-white">
          <span className={open ? "lg:hidden" : ""}>TL</span>
          {open && <span className="hidden lg:inline">Tutor LMS</span>}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
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
