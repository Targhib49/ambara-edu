import Link from "next/link";

export type Crumb = { label: string; href?: string };

/** Home / Section / Current — matches the reference course-builder header. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-zinc-300">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-700 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="max-w-[16rem] truncate text-zinc-700" title={item.label}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
