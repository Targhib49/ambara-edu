import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { LinkPendingIndicator } from "@/components/ui/LinkPendingIndicator";

/**
 * The top of every tutor page: where you are, what this is, and the page's
 * main actions on the right. Creating things starts here, never from a form
 * parked somewhere down the page.
 */
export function PageHeader({
  crumbs,
  title,
  meta,
  actions,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  /** One line of context under the title — counts, status. */
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Breadcrumbs items={crumbs} />
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          {meta && <div className="mt-1 text-sm text-zinc-500">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export type PageTab = { key: string; label: string; href: string; count?: number };

/**
 * Sections of one page, as links. Each tab is its own URL, so a tab survives a
 * reload and can be linked to, and the server only loads what the tab shows.
 */
export async function PageTabs({ tabs, active }: { tabs: PageTab[]; active: string }) {
  const t = await getT();
  return (
    <nav className="flex gap-6 overflow-x-auto border-b border-zinc-200" aria-label={t("pageTabs.sections")}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
              isActive ? "border-blue-600 text-blue-700" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  isActive ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {t.count}
              </span>
            )}
            <LinkPendingIndicator />
          </Link>
        );
      })}
    </nav>
  );
}
