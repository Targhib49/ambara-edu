"use client";

import { useState } from "react";
import { ProjectEditor } from "./ProjectEditor";
import { ENTRY_FILE } from "@/lib/projects/schema";

const noop = () => {};

/**
 * A project's files, read-only, one tab per file — a student's finished work
 * or the answer key. `changed` marks the files a step touched, and the first
 * of them opens first.
 */
export function ProjectFilesViewer({ files, changed = [] }: { files: Record<string, string>; changed?: string[] }) {
  const names = Object.keys(files).sort((a, b) => (a === ENTRY_FILE ? -1 : b === ENTRY_FILE ? 1 : a.localeCompare(b)));
  const [active, setActive] = useState(names.find((n) => changed.includes(n)) ?? names[0] ?? ENTRY_FILE);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white">
      <div className="flex overflow-x-auto border-b border-zinc-200 bg-zinc-50">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActive(name)}
            className={`shrink-0 border-r border-zinc-200 px-3 py-2 font-mono text-xs ${
              name === active ? "bg-white text-zinc-900" : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {name}
            {changed.includes(name) && <span className="ml-1 text-blue-600" aria-hidden>●</span>}
          </button>
        ))}
      </div>
      <div className="h-96">
        <ProjectEditor fileName={active} text={files[active] ?? ""} readOnly onChange={noop} />
      </div>
    </div>
  );
}
