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

// Control-systems batch. Coefficient arrays are highest-degree-first:
// [1, 2, 1] means s² + 2s + 1.

export const stepResponseProps = z
  .object({
    num: z.array(z.number().finite()).min(1).max(4),
    den: z.array(z.number().finite()).min(2).max(5),
    tMax: z.number().min(1).max(60),
  })
  .refine((d) => d.den[0] !== 0, "den's leading coefficient can't be 0")
  .refine(
    (d) => d.den.length > d.num.length,
    "den must have higher degree than num (strictly proper system)"
  );

export const pidTuningProps = z
  .object({
    plantNum: z.array(z.number().finite()).min(1).max(3),
    plantDen: z.array(z.number().finite()).min(2).max(5),
    kp: z.number().min(0).max(50),
    ki: z.number().min(0).max(50),
    kd: z.number().min(0).max(50),
  })
  .refine((d) => d.plantDen[0] !== 0, "plantDen's leading coefficient can't be 0")
  .refine(
    (d) => d.plantDen.length >= d.plantNum.length + 2,
    "plant must have relative degree ≥ 2 (plantDen at least two coefficients longer than plantNum) so the PID closed loop stays strictly proper"
  );

export const poleZeroExplorerProps = z.object({
  zeta: z.number().min(0).max(2),
  omegaN: z.number().min(0.1).max(10),
});

/** Discriminated union stored as the VISUALIZATION block's data payload. */
export const visualizationDataSchema = z.discriminatedUnion("component", [
  z.object({ component: z.literal("sorting_visualizer"), props: sortingVisualizerProps }),
  z.object({ component: z.literal("loop_stepper"), props: loopStepperProps }),
  z.object({ component: z.literal("structure_ops"), props: structureOpsProps }),
  z.object({ component: z.literal("step_response"), props: stepResponseProps }),
  z.object({ component: z.literal("pid_tuning"), props: pidTuningProps }),
  z.object({ component: z.literal("pole_zero_explorer"), props: poleZeroExplorerProps }),
]);

export type VisualizationData = z.infer<typeof visualizationDataSchema>;
export type VizComponentName = VisualizationData["component"];

export const VIZ_LABELS: Record<VizComponentName, string> = {
  sorting_visualizer: "Sorting visualizer",
  loop_stepper: "Loop stepper",
  structure_ops: "Stack / queue operations",
  step_response: "Step / impulse response",
  pid_tuning: "PID tuning",
  pole_zero_explorer: "Pole-zero explorer",
};

export const vizDefaultProps: { [K in VizComponentName]: Extract<VisualizationData, { component: K }>["props"] } = {
  sorting_visualizer: {
    algorithm: "bubble",
    values: [23, 7, 42, 15, 4, 30, 11],
  },
  loop_stepper: { start: 1, end: 6, step: 1, operation: "sum" },
  structure_ops: { structure: "stack", initial: ["A", "B", "C"], capacity: 8 },
  // G(s) = 1 / (s² + 2s + 1) — critically damped double pole at s = −1
  step_response: { num: [1], den: [1, 2, 1], tMax: 10 },
  // Plant 1 / (s(s + 1)) — the classic integrator-plus-lag teaching plant
  pid_tuning: { plantNum: [1], plantDen: [1, 1, 0], kp: 2, ki: 1, kd: 1 },
  pole_zero_explorer: { zeta: 0.3, omegaN: 2 },
};

export const defaultVisualizationData: VisualizationData = {
  component: "sorting_visualizer",
  props: vizDefaultProps.sorting_visualizer,
};
