"use client";

import { useState, useTransition } from "react";
import type { AnyBlock, BlockDataMap } from "@/lib/blocks/schema";
import { updateBlock } from "@/lib/actions/blocks";

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-zinc-500";

function SaveButton({ pending, saved }: { pending: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
    >
      {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
    </button>
  );
}

function useSave(blockId: string) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const save = (data: unknown) =>
    startTransition(async () => {
      await updateBlock(blockId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  return { pending, saved, save };
}

function MarkdownEditor({ block }: { block: { id: string; data: BlockDataMap["MARKDOWN"] } }) {
  const [markdown, setMarkdown] = useState(block.data.markdown);
  const { pending, saved, save } = useSave(block.id);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ markdown });
      }}
      className="space-y-2"
    >
      <label className={labelCls}>Markdown (supports GFM + inline $LaTeX$)</label>
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        rows={8}
        className={`${inputCls} font-mono`}
      />
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

function EquationEditor({ block }: { block: { id: string; data: BlockDataMap["EQUATION"] } }) {
  const [latex, setLatex] = useState(block.data.latex);
  const [display, setDisplay] = useState(block.data.display);
  const { pending, saved, save } = useSave(block.id);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ latex, display });
      }}
      className="space-y-2"
    >
      <label className={labelCls}>LaTeX</label>
      <textarea
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        rows={3}
        className={`${inputCls} font-mono`}
        placeholder={String.raw`\frac{d}{dt}x(t) = Ax(t) + Bu(t)`}
      />
      <label className="flex items-center gap-2 text-xs text-zinc-600">
        <input type="checkbox" checked={display} onChange={(e) => setDisplay(e.target.checked)} />
        Display mode (centered, own line)
      </label>
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

function CodeSnippetEditor({ block }: { block: { id: string; data: BlockDataMap["CODE_SNIPPET"] } }) {
  const [language, setLanguage] = useState(block.data.language);
  const [code, setCode] = useState(block.data.code);
  const { pending, saved, save } = useSave(block.id);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ language, code });
      }}
      className="space-y-2"
    >
      <div>
        <label className={labelCls}>Language</label>
        <input
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`${inputCls} max-w-40`}
          placeholder="python"
        />
      </div>
      <div>
        <label className={labelCls}>Code</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={8}
          className={`${inputCls} font-mono`}
          spellCheck={false}
        />
      </div>
      <SaveButton pending={pending} saved={saved} />
    </form>
  );
}

function FileAttachmentEditor({ block }: { block: { data: BlockDataMap["FILE_ATTACHMENT"] } }) {
  return (
    <p className="text-xs text-zinc-500">
      Attached: <span className="font-medium text-zinc-700">{block.data.fileName}</span> — to
      replace it, delete this block and upload again.
    </p>
  );
}

/** Client component: type-specific edit form for a block. */
export function BlockEditor({ block }: { block: AnyBlock }) {
  switch (block.type) {
    case "MARKDOWN":
      return <MarkdownEditor block={block} />;
    case "EQUATION":
      return <EquationEditor block={block} />;
    case "CODE_SNIPPET":
      return <CodeSnippetEditor block={block} />;
    case "FILE_ATTACHMENT":
      return <FileAttachmentEditor block={block} />;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
