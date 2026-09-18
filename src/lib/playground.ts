import {
  VIZ_LABELS,
  vizDefaultProps,
  type VisualizationData,
  type VizComponentName,
} from "@/lib/viz/schemas";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Translate } from "@/lib/i18n/translate";

/**
 * The playground is a place to poke at the interactive pieces outside a
 * lesson. It deliberately builds its list from the visualization registry
 * rather than a hand-kept copy, so a component added for a lesson shows up
 * here on its own and can't quietly fall out of sync.
 */
export type PlaygroundItem =
  // A visualization's title is its name and stays as written; the scratchpad
  // is a tool, so its title is worded like the rest of the interface.
  | { slug: string; title: string; blurbKey: MessageKey | null; kind: "viz"; data: VisualizationData }
  | { slug: string; titleKey: MessageKey; blurbKey: MessageKey; kind: "python" };

/**
 * Keyed loosely by component name rather than by the VizComponentName union on
 * purpose. A blurb may describe a component that isn't in the registry yet (or
 * any more), and a visualization with no blurb still lists — it just shows no
 * description. Tying this to the union would turn "wrote the copy early" into
 * a compile error.
 */
const VIZ_BLURBS: Record<string, MessageKey> = {
  sorting_visualizer: "vizBlurb.sorting",
  loop_stepper: "vizBlurb.loop",
  structure_ops: "vizBlurb.structure",
  step_response: "vizBlurb.stepResponse",
  pid_tuning: "vizBlurb.pid",
  pole_zero_explorer: "vizBlurb.poleZero",
  em_widget: "vizBlurb.em",
};

export const PYTHON_ITEM = {
  slug: "python",
  titleKey: "playground.python.title",
  blurbKey: "playground.python.blurb",
  kind: "python",
} as const satisfies PlaygroundItem;

export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  PYTHON_ITEM,
  ...(Object.keys(VIZ_LABELS) as VizComponentName[]).map((component) => ({
    slug: component.replace(/_/g, "-"),
    title: VIZ_LABELS[component],
    blurbKey: VIZ_BLURBS[component] ?? null,
    kind: "viz" as const,
    // The registry's defaults are already valid for each component's schema,
    // which is what makes rendering these outside a saved block safe.
    data: { component, props: vizDefaultProps[component] } as VisualizationData,
  })),
];

/** The title as shown: a visualization's own name, or the scratchpad's in the viewer's language. */
export function playgroundItemTitle(item: PlaygroundItem, t: Translate): string {
  return item.kind === "python" ? t(item.titleKey) : item.title;
}

export function findPlaygroundItem(slug: string): PlaygroundItem | undefined {
  return PLAYGROUND_ITEMS.find((item) => item.slug === slug);
}

/** Every registered visualization with its default settings — the tutor's library. */
export const VIZ_LIBRARY = PLAYGROUND_ITEMS.filter((item) => item.kind === "viz");
