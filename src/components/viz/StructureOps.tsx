"use client";

import { useState } from "react";
import type { z } from "zod";
import type { structureOpsProps } from "@/lib/viz/schemas";
import { vizBtn, vizBtnPrimary } from "./controls";

type Props = z.infer<typeof structureOpsProps>;

export function StructureOps({ structure, initial, capacity }: Props) {
  const [items, setItems] = useState(initial);
  const [value, setValue] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const isStack = structure === "stack";
  const addLabel = isStack ? "Push" : "Enqueue";
  const removeLabel = isStack ? "Pop" : "Dequeue";

  function report(entry: string) {
    setLog((l) => [entry, ...l].slice(0, 6));
  }

  function add() {
    const v = value.trim().slice(0, 6);
    if (!v) return;
    if (items.length >= capacity) {
      report(`${addLabel.toLowerCase()}(${v}) ✗ — full (capacity ${capacity})`);
      return;
    }
    setItems((arr) => [...arr, v]);
    setValue("");
    report(`${addLabel.toLowerCase()}(${v})`);
  }

  function remove() {
    if (items.length === 0) {
      report(`${removeLabel.toLowerCase()}() ✗ — ${structure} is empty`);
      return;
    }
    // Stack removes from the top (end); queue removes from the front.
    const taken = isStack ? items[items.length - 1] : items[0];
    setItems((arr) => (isStack ? arr.slice(0, -1) : arr.slice(1)));
    report(`${removeLabel.toLowerCase()}() → ${taken}`);
  }

  const boxCls =
    "flex h-9 min-w-14 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-50 px-2 font-mono text-sm font-semibold text-blue-800";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-700">
          {isStack ? "Stack (LIFO — last in, first out)" : "Queue (FIFO — first in, first out)"}
        </span>
        <span className="text-xs text-zinc-400">
          {items.length} / {capacity}
        </span>
      </div>

      <div className="flex min-h-44 items-center justify-center rounded-md bg-zinc-50 p-4">
        {items.length === 0 ? (
          <p className="text-xs italic text-zinc-400">empty</p>
        ) : isStack ? (
          <div className="flex flex-col-reverse items-center gap-1.5">
            {items.map((item, i) => (
              <div key={`${i}-${item}`} className="flex items-center gap-2">
                <div className={boxCls}>{item}</div>
                <span className="w-12 text-xs text-zinc-400">
                  {i === items.length - 1 ? "← top" : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              {items.map((item, i) => (
                <div key={`${i}-${item}`} className={boxCls}>
                  {item}
                </div>
              ))}
            </div>
            <div className="flex w-full justify-between text-xs text-zinc-400">
              <span>↑ front (leaves first)</span>
              <span>rear (joins here) ↑</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          maxLength={6}
          placeholder="value"
          className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        />
        <button className={vizBtnPrimary} onClick={add}>
          {addLabel}
        </button>
        <button className={vizBtn} onClick={remove}>
          {removeLabel}
        </button>
        <button
          className={vizBtn}
          onClick={() => {
            setItems(initial);
            setLog([]);
            setValue("");
          }}
        >
          ⏮ Reset
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-3 rounded-md bg-zinc-50 px-3 py-2">
          {log.map((entry, i) => (
            <p key={i} className={`font-mono text-xs ${i === 0 ? "text-zinc-800" : "text-zinc-400"}`}>
              {entry}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
