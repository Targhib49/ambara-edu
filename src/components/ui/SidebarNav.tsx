"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompletionMark } from "@/components/ui/CompletionMark";

export type SidebarSection = {
  title?: string;
  /** Small counter beside the section title, e.g. "2/5". */
  meta?: string;
  items: { href: string; label: string; badge?: string; done?: boolean }[];
};

export function SidebarNav({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <p className="mb-1.5 flex items-baseline gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <span className="min-w-0 flex-1">{section.title}</span>
              {section.meta && <span className="shrink-0 font-normal">{section.meta}</span>}
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
                    {item.done !== undefined && <CompletionMark done={item.done} />}
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
