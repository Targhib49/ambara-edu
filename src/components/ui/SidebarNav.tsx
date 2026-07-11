"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarSection = {
  title?: string;
  items: { href: string; label: string; badge?: string }[];
};

export function SidebarNav({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {section.title}
            </p>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm ${
                      active
                        ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                        : "border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
