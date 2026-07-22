"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createCollapsibleStore } from "@/lib/ui/collapsibleStore";
import { mobileNav } from "@/lib/ui/mobileNavStore";
import { HomeIcon, BookIcon, ClipboardIcon, CalendarIcon, UsersIcon, ChevronLeftIcon, CloseIcon } from "@/components/ui/icons";

const { useOpen, setOpen } = createCollapsibleStore("lms:tutorNavOpen");

const NAV_ITEMS = [
  { href: "/tutor", label: "Home", icon: HomeIcon, exact: true },
  { href: "/tutor/tracks", label: "Tracks", icon: BookIcon, exact: false },
  { href: "/tutor/quizzes", label: "Quizzes", icon: ClipboardIcon, exact: false },
  { href: "/tutor/sessions", label: "Sessions", icon: CalendarIcon, exact: false },
  { href: "/tutor/students", label: "Students", icon: UsersIcon, exact: false },
] as const;

function NavLinks({ pathname, showLabels, onLinkClick }: { pathname: string; showLabels: boolean; onLinkClick?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 px-2 py-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm ${
              active
                ? "border-blue-400 bg-white/10 font-medium text-white"
                : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {showLabels && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function TutorSidebar() {
  const pathname = usePathname();
  const open = useOpen();
  const mobileOpen = mobileNav.useOpen();

  return (
    <>
      {/* Desktop / tablet rail — hidden below lg, replaced by the drawer below. */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-slate-900 transition-[width] duration-200 lg:flex ${
          open ? "w-56" : "w-16"
        }`}
      >
        <div className="flex h-14 items-center gap-2 px-4">
          <span className="text-lg font-bold text-white">{open ? "AmbaraEdu" : "AE"}</span>
        </div>
        <NavLinks pathname={pathname} showLabels={open} />
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-10 items-center justify-center border-t border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <ChevronLeftIcon className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
        </button>
      </aside>

      {/* Mobile drawer, triggered by the hamburger in TutorTopBar. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => mobileNav.setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex h-full w-64 flex-col bg-slate-900">
            <div className="flex h-14 items-center justify-between gap-2 px-4">
              <span className="text-lg font-bold text-white">AmbaraEdu</span>
              <button
                onClick={() => mobileNav.setOpen(false)}
                aria-label="Close menu"
                className="text-slate-400 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} showLabels onLinkClick={() => mobileNav.setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
