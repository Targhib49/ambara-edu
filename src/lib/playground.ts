import {
  VIZ_LABELS,
  vizDefaultProps,
  type VisualizationData,
  type VizComponentName,
} from "@/lib/viz/schemas";

/**
 * The playground is a place to poke at the interactive pieces outside a
 * lesson. It deliberately builds its list from the visualization registry
 * rather than a hand-kept copy, so a component added for a lesson shows up
 * here on its own and can't quietly fall out of sync.
 */
export type PlaygroundItem =
  | { slug: string; title: string; blurb: string; kind: "viz"; data: VisualizationData }
  | { slug: string; title: string; blurb: string; kind: "python" };

/**
 * Keyed loosely by component name rather than by the VizComponentName union on
 * purpose. A blurb may describe a component that isn't in the registry yet (or
 * any more), and a visualization with no blurb still lists — it just shows no
 * description. Tying this to the union would turn "wrote the copy early" into
 * a compile error.
 */
const VIZ_BLURBS: Record<string, string> = {
  sorting_visualizer: "Watch a sorting algorithm rearrange a list one comparison at a time.",
  loop_stepper: "Step through a loop and see the counter and accumulator change on each pass.",
  structure_ops: "Push and pop a stack, or enqueue and dequeue a queue, and watch it react.",
  step_response: "Feed a system a step or impulse and see how its output settles.",
  pid_tuning: "Drag the P, I and D gains and watch the response overshoot, oscillate or settle.",
  pole_zero_explorer: "Move poles around the s-plane and see the shape of the response follow.",
  em_widget: "Vector algebra visualisations from the Electromagnetics course.",
};

export const PYTHON_ITEM: PlaygroundItem = {
  slug: "python",
  title: "Python scratchpad",
  blurb: "Write and run Python in the browser. Nothing is saved or marked — experiment freely.",
  kind: "python",
};

export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  PYTHON_ITEM,
  ...(Object.keys(VIZ_LABELS) as VizComponentName[]).map((component) => ({
    slug: component.replace(/_/g, "-"),
    title: VIZ_LABELS[component],
    blurb: VIZ_BLURBS[component] ?? "",
    kind: "viz" as const,
    // The registry's defaults are already valid for each component's schema,
    // which is what makes rendering these outside a saved block safe.
    data: { component, props: vizDefaultProps[component] } as VisualizationData,
  })),
];

export function findPlaygroundItem(slug: string): PlaygroundItem | undefined {
  return PLAYGROUND_ITEMS.find((item) => item.slug === slug);
}

/** Every registered visualization with its default settings — the tutor's library. */
export const VIZ_LIBRARY = PLAYGROUND_ITEMS.filter((item) => item.kind === "viz");
