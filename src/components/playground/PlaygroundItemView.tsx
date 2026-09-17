import type { PlaygroundItem } from "@/lib/playground";
import { getT } from "@/lib/i18n/server";
import { VizBlock } from "@/components/viz/VizBlock";
import { CodeEditorBlock } from "@/components/blocks/CodeEditorBlock";
import { PlaygroundFrame } from "@/components/playground/PlaygroundFrame";

const STARTER_CODE = `# Anything you like — this runs in your browser.
for n in range(1, 6):
    print(n, "squared is", n * n)
`;

/** The Python tool, or (tutors) a library visualization with its default settings. */
export async function PlaygroundItemView({
  item,
  basePath,
  homeHref,
}: {
  item: PlaygroundItem;
  basePath: string;
  homeHref: string;
}) {
  const t = await getT();
  const section = item.kind === "python" ? "tools" : "library";
  return (
    <PlaygroundFrame
      crumbs={[
        { label: t("nav.home"), href: homeHref },
        { label: t("playground.title"), href: basePath.startsWith("/tutor") ? `${basePath}?tab=${section}` : basePath },
        { label: item.title },
      ]}
      title={item.title}
      meta={item.kind === "viz" ? `Preview with default settings · ${item.blurb}` : item.blurb}
    >
      {item.kind === "python" ? <CodeEditorBlock starterCode={STARTER_CODE} /> : <VizBlock data={item.data} />}
    </PlaygroundFrame>
  );
}
