import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { isEnabled } from "@/lib/flags";
import { findPlaygroundItem, PLAYGROUND_ITEMS } from "@/lib/playground";
import { VizBlock } from "@/components/viz/VizBlock";
import { CodeEditorBlock } from "@/components/blocks/CodeEditorBlock";

const STARTER_CODE = `# Anything you like — this runs in your browser.
for n in range(1, 6):
    print(n, "squared is", n * n)
`;

export default async function PlaygroundItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  await requireStudent();
  if (!(await isEnabled("playground"))) notFound();

  const { item: slug } = await params;
  const item = findPlaygroundItem(slug);
  if (!item) notFound();

  const index = PLAYGROUND_ITEMS.findIndex((i) => i.slug === item.slug);
  const previous = index > 0 ? PLAYGROUND_ITEMS[index - 1] : null;
  const next = index < PLAYGROUND_ITEMS.length - 1 ? PLAYGROUND_ITEMS[index + 1] : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/dashboard" },
            { label: "Playground", href: "/playground" },
            { label: item.title },
          ]}
        />
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        {item.blurb && <p className="max-w-2xl text-sm text-zinc-600">{item.blurb}</p>}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:p-6">
        {item.kind === "python" ? (
          <CodeEditorBlock starterCode={STARTER_CODE} />
        ) : (
          <VizBlock data={item.data} />
        )}
      </div>

      <nav className="flex items-stretch justify-between gap-4">
        {previous ? (
          <Link
            href={`/playground/${previous.slug}`}
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
            href={`/playground/${next.slug}`}
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
