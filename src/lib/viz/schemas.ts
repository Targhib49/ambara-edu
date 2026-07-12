import { z } from "zod";

/**
 * Server-safe half of the visualization framework: prop schemas, defaults,
 * and labels — no React imports, so block validation (server actions) can use
 * it without dragging component code into the server graph.
 *
 * Adding a visualization:
 *   1. add its props schema + defaults + label here
 *   2. add the entry to `visualizationDataSchema` below
 *   3. register the client component in src/components/viz/VizBlock.tsx
 */

export const sortingVisualizerProps = z.object({
  algorithm: z.enum(["bubble", "selection", "insertion"]),
  values: z.array(z.number().int().min(1).max(99)).min(3).max(20),
});

export const loopStepperProps = z.object({
  start: z.number().int().min(-100).max(100),
  end: z.number().int().min(-100).max(100),
  step: z
    .number()
    .int()
    .min(-10)
    .max(10)
    .refine((n) => n !== 0, "step can't be 0"),
  operation: z.enum(["sum", "product"]),
});

export const structureOpsProps = z.object({
  structure: z.enum(["stack", "queue"]),
  initial: z.array(z.string().min(1).max(6)).max(8),
  capacity: z.number().int().min(3).max(12),
});

/** Discriminated union stored as the VISUALIZATION block's data payload. */
export const visualizationDataSchema = z.discriminatedUnion("component", [
  z.object({ component: z.literal("sorting_visualizer"), props: sortingVisualizerProps }),
  z.object({ component: z.literal("loop_stepper"), props: loopStepperProps }),
  z.object({ component: z.literal("structure_ops"), props: structureOpsProps }),
]);

export type VisualizationData = z.infer<typeof visualizationDataSchema>;
export type VizComponentName = VisualizationData["component"];

export const VIZ_LABELS: Record<VizComponentName, string> = {
  sorting_visualizer: "Sorting visualizer",
  loop_stepper: "Loop stepper",
  structure_ops: "Stack / queue operations",
};

export const vizDefaultProps: { [K in VizComponentName]: Extract<VisualizationData, { component: K }>["props"] } = {
  sorting_visualizer: {
    algorithm: "bubble",
    values: [23, 7, 42, 15, 4, 30, 11],
  },
  loop_stepper: { start: 1, end: 6, step: 1, operation: "sum" },
  structure_ops: { structure: "stack", initial: ["A", "B", "C"], capacity: 8 },
};

export const defaultVisualizationData: VisualizationData = {
  component: "sorting_visualizer",
  props: vizDefaultProps.sorting_visualizer,
};
