"use client";

import type { emWidgetProps } from "@/lib/viz/schemas";
import type { z } from "zod";

type Props = z.infer<typeof emWidgetProps>;

const TITLES: Record<Props["widget"], string> = {
  unit_vector_explorer: "Cylindrical unit vector explorer",
  coordinate_explorer: "Coordinate system explorer",
  dot_cross_playground: "Dot & cross product playground",
};

/**
 * Frames one of the EM course's self-contained HTML widgets from
 * `public/em-widgets/`. These are the course author's own files, kept verbatim
 * so the LMS copy and the standalone copy can't drift — porting them to React
 * would fork working, already-verified code.
 *
 * Same-origin by construction (the `widget` enum maps to a fixed path), so no
 * sandbox attribute: locking it down would need `allow-same-origin` anyway,
 * which buys nothing here.
 */
export function EmWidget({ widget, height, caption }: Props) {
  const title = TITLES[widget];
  return (
    <figure
      className="space-y-2"
      // Widgets collapse to a single column below ~760px and get taller, so the
      // frame grows on narrow screens rather than trapping the page in a scroll.
      style={{ "--em-h": `${height}px`, "--em-h-sm": `${height + 320}px` } as React.CSSProperties}
    >
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <iframe
          src={`/em-widgets/${widget}.html`}
          title={caption || title}
          loading="lazy"
          className="h-[var(--em-h-sm)] w-full sm:h-[var(--em-h)]"
        />
      </div>
      <figcaption className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span className="min-w-0 flex-1">{caption || title}</span>
        <a
          href={`/em-widgets/${widget}.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-blue-700 hover:underline"
        >
          Open full screen ↗
        </a>
      </figcaption>
    </figure>
  );
}
