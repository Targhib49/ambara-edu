import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PLAYGROUND_ITEMS, type PlaygroundItem } from "@/lib/playground";
import { VizBlock } from "@/components/viz/VizBlock";
import { CodeEditorBlock } from "@/components/blocks/CodeEditorBlock";

const STARTER_CODE = `# Anything you like — this runs in your browser.
for n in range(1, 6):
    print(n, "squared is", n * n)
`;

/** One playground item with previous/next between items, shared by both roles. */
export function PlaygroundItemView({
  item,
  basePath,
  homeHref,
}: {
  item: PlaygroundItem;
  basePath: string;
  homeHref: string;
}) {
  const index = PLAYGROUND_ITEMS.findIndex((i) => i.slug === item.slug);
  const previous = index > 0 ? PLAYGROUND_ITEMS[index - 1] : null;
  const next = index < PLAYGROUND_ITEMS.length - 1 ? PLAYGROUND_ITEMS[index + 1] : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: homeHref },
            { label: "Playground", href: basePath },
            { label: item.title },
          ]}
        />
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        {item.blurb && <p className="max-w-2xl text-sm text-zinc-600">{item.blurb}</p>}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:p-6">
        {item.kind === "python" ? <CodeEditorBlock starterCode={STARTER_CODE} /> : <VizBlock data={item.data} />}
      </div>

      <nav className="flex items-stretch justify-between gap-4">
        {previous ? (
          <Link
            href={`${basePath}/${previous.slug}`}
            className="max-w-[48%] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 hover:border-blue-400 hover:text-blue-700"
          >
            <span className="block text-xs text-zinc-400">← Previous</span>
            <span className="mt-0.5 block truncate font-medium">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`${basePath}/${next.slug}`}
            className="ml-auto max-w-[48%] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-right text-sm text-zinc-700 hover:border-blue-400 hover:text-blue-700"
          >
            <span className="block text-xs text-zinc-400">Next →</span>
            <span className="mt-0.5 block truncate font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
