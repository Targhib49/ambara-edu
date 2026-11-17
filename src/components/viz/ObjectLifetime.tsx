"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { z } from "zod";
import type { objectLifetimeProps } from "@/lib/viz/schemas";
import { LIFETIME_SCENARIOS, lifetimeFrames, type LifetimeObject, type ObjectStatus } from "@/lib/viz/objectLifetime";
import { vizBtn, vizBtnPrimary } from "./controls";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";

type Props = z.infer<typeof objectLifetimeProps>;

const STATUS_STYLE: Record<ObjectStatus, string> = {
  building: "border-dashed border-amber-400 bg-amber-50",
  alive: "border-solid border-blue-300 bg-blue-50",
  ending: "border-dashed border-red-300 bg-red-50",
};

const STATUS_LABEL: Partial<Record<ObjectStatus, MessageKey>> = {
  building: "viz.life.building",
  ending: "viz.life.ending",
};

/**
 * Steps through a short C++ program and shows which objects exist at each
 * point: created by constructors, destroyed by destructors, with member
 * objects and base-class parts drawn inside the object they belong to. The
 * newest object sits at the top, which is the order destruction follows.
 */
export function ObjectLifetime({ scenario: name }: Props) {
  const t = useT();
  const scenario = LIFETIME_SCENARIOS[name];
  const frames = useMemo(() => lifetimeFrames(scenario), [scenario]);
  const lines = useMemo(() => scenario.program.split("\n"), [scenario]);
  // Objects in the order they first come to life, so the newest can go on top.
  const creationOrder = useMemo(() => {
    const seen: string[] = [];
    for (const step of scenario.steps) for (const op of step.ops ?? []) if (!seen.includes(op.id)) seen.push(op.id);
    return seen;
  }, [scenario]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[idx];
  const atEnd = idx >= frames.length - 1;
  const running = playing && !atEnd;

  // The code panel scrolls on its own; keep the executing line in view without moving the page.
  const codeRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const pane = codeRef.current;
    const active = pane?.querySelector<HTMLElement>("[data-active]");
    if (!pane || !active) return;
    const top = active.offsetTop; // measured from the panel, which is `relative`
    if (top < pane.scrollTop || top + active.offsetHeight > pane.scrollTop + pane.clientHeight) {
      pane.scrollTo({ top: Math.max(0, top - pane.clientHeight / 3), behavior: "smooth" });
    }
  }, [frame.line]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, frames.length - 1)), 1600);
    return () => clearInterval(timer);
  }, [running, frames.length]);

  const objects: LifetimeObject[] = scenario.objects;
  const childrenOf = (id: string) => objects.filter((o) => o.parent === id && frame.status.has(o.id));
  const topLevel = creationOrder
    .map((id) => objects.find((o) => o.id === id)!)
    .filter((o) => !o.parent && frame.status.has(o.id))
    .reverse();

  function renderObject(object: LifetimeObject) {
    const status = frame.status.get(object.id)!;
    const label = STATUS_LABEL[status];
    return (
      <div
        key={object.id}
        className={`rounded-md border-2 px-3 py-2 transition-colors ${STATUS_STYLE[status]} ${
          frame.changed.has(object.id) ? "ring-2 ring-blue-500 ring-offset-1" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-mono text-xs font-semibold text-zinc-900">{object.label}</span>
          {object.role && <span className="rounded bg-white/70 px-1.5 text-[10px] text-zinc-500">{object.role}</span>}
          {label && <span className="text-[10px] font-medium text-zinc-500">{t(label)}</span>}
        </div>
        {childrenOf(object.id).length > 0 && <div className="mt-2 space-y-2">{childrenOf(object.id).map(renderObject)}</div>}
      </div>
    );
  }

  const vars = Object.entries(frame.vars);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-zinc-800">{scenario.title}</p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <pre ref={codeRef} className="relative max-h-[26rem] overflow-auto rounded-md bg-zinc-900 py-3 text-xs leading-6">
          {lines.map((line, i) => (
            <div key={i} data-active={i + 1 === frame.line ? "" : undefined} className={`flex px-3 ${i + 1 === frame.line ? "bg-blue-600/40 text-white" : "text-zinc-300"}`}>
              <span className="mr-3 w-5 shrink-0 select-none text-right text-zinc-500">{i + 1}</span>
              <span className="whitespace-pre">{line || " "}</span>
            </div>
          ))}
        </pre>

        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{t("viz.life.objects")}</p>
            <div className="mt-1.5 min-h-16 space-y-2">
              {topLevel.length === 0 ? <p className="text-xs italic text-zinc-400">{t("viz.life.none")}</p> : topLevel.map(renderObject)}
            </div>
            {topLevel.length > 1 && <p className="mt-1 text-[10px] text-zinc-400">{t("viz.life.newestFirst")}</p>}
          </div>

          {vars.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{t("viz.life.static")}</p>
              <div className="mt-1.5 space-y-1">
                {vars.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 font-mono text-xs">
                    <span className="text-zinc-700">{key}</span>
                    <span className="font-semibold text-violet-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{t("viz.life.output")}</p>
            <pre className="mt-1.5 min-h-9 whitespace-pre-wrap break-all rounded-md bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100">
              {frame.output || " "}
            </pre>
          </div>
        </div>
      </div>

      <p className="mt-3 min-h-10 text-center text-sm text-zinc-700">{frame.note}</p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button className={vizBtn} onClick={() => { setPlaying(false); setIdx(0); }}>
          {t("viz.reset")}
        </button>
        <button className={vizBtn} disabled={idx === 0} onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }}>
          {t("viz.back")}
        </button>
        <button className={vizBtnPrimary} disabled={atEnd} onClick={() => setPlaying((p) => !p)}>
          {running ? t("viz.pause") : t("viz.play")}
        </button>
        <button className={vizBtn} disabled={atEnd} onClick={() => { setPlaying(false); setIdx((i) => Math.min(frames.length - 1, i + 1)); }}>
          {t("viz.step")}
        </button>
        <span className="text-xs text-zinc-400">
          {idx + 1} / {frames.length}
        </span>
      </div>
    </div>
  );
}
