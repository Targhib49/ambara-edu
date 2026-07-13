"use client";

import type { VisualizationData } from "@/lib/viz/schemas";
import { SortingVisualizer } from "./SortingVisualizer";
import { LoopStepper } from "./LoopStepper";
import { StructureOps } from "./StructureOps";
import { StepResponse } from "./StepResponse";
import { PidTuning } from "./PidTuning";
import { PoleZeroExplorer } from "./PoleZeroExplorer";

/**
 * Client-side dispatcher for the VISUALIZATION block: maps the stored
 * `component` name to its React component. Data arrives already validated
 * against `visualizationDataSchema`, so the switch is exhaustive by type.
 */
export function VizBlock({ data }: { data: VisualizationData }) {
  switch (data.component) {
    case "sorting_visualizer":
      return <SortingVisualizer {...data.props} />;
    case "loop_stepper":
      return <LoopStepper {...data.props} />;
    case "structure_ops":
      return <StructureOps {...data.props} />;
    case "step_response":
      return <StepResponse {...data.props} />;
    case "pid_tuning":
      return <PidTuning {...data.props} />;
    case "pole_zero_explorer":
      return <PoleZeroExplorer {...data.props} />;
    default: {
      const _exhaustive: never = data;
      return _exhaustive;
    }
  }
}
