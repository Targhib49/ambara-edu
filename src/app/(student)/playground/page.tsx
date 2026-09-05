import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { isEnabled } from "@/lib/flags";
import { PLAYGROUND_ITEMS } from "@/lib/playground";
import { badgeColorForKey } from "@/lib/ui/palette";

export default async function PlaygroundPage() {
  await requireStudent();
  // Off means the route doesn't exist, not that it renders empty — otherwise a
  // guessed URL would still show the feature.
  if (!(await isEnabled("playground"))) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Playground" }]} />
        <h1 className="text-2xl font-semibold">Playground</h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Every interactive piece from the courses, free to poke at on its own. Nothing here is
          marked or saved — change things, break things, start over.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {PLAYGROUND_ITEMS.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/playground/${item.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className={`h-1.5 ${badgeColorForKey(item.title).split(" ")[0]}`} />
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h2 className="font-medium text-zinc-900 group-hover:text-blue-700">{item.title}</h2>
                {item.blurb && <p className="text-sm text-zinc-500">{item.blurb}</p>}
                <span className="mt-auto pt-2 text-xs font-medium text-blue-700">Open →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
