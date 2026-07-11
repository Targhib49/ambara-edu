import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import { codeToHtml } from "shiki";
import type { AnyBlock } from "@/lib/blocks/schema";
import { toAnyBlock } from "@/lib/blocks/schema";
import type { BlockType } from "@/generated/prisma/enums";

function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-zinc max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

function EquationRenderer({ latex, display }: { latex: string; display: boolean }) {
  let html: string;
  try {
    html = katex.renderToString(latex, { displayMode: display, throwOnError: true });
  } catch {
    return (
      <p className="rounded bg-red-50 px-3 py-2 font-mono text-sm text-red-700">
        Invalid LaTeX: {latex}
      </p>
    );
  }
  return (
    <div
      className={display ? "my-2 overflow-x-auto text-center" : "inline-block"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

async function CodeSnippetRenderer({ language, code }: { language: string; code: string }) {
  let html: string;
  try {
    html = await codeToHtml(code, { lang: language, theme: "github-dark" });
  } catch {
    // unknown language — fall back to plaintext
    html = await codeToHtml(code, { lang: "text", theme: "github-dark" });
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentRenderer({
  blockId,
  fileName,
  sizeBytes,
}: {
  blockId: string;
  fileName: string;
  sizeBytes: number;
}) {
  return (
    <a
      href={`/api/files/${blockId}`}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden>📎</span>
      {fileName}
      <span className="text-xs text-zinc-500">({formatBytes(sizeBytes)})</span>
    </a>
  );
}

/**
 * Server component: validates the raw JSON payload and dispatches to the
 * type-specific renderer. New block types get a case here (the switch is
 * exhaustive over BlockType, so the compiler flags omissions).
 */
export function BlockRenderer({
  block,
}: {
  block: { id: string; type: BlockType; data: unknown };
}) {
  let parsed: AnyBlock;
  try {
    parsed = toAnyBlock(block);
  } catch {
    return (
      <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
        This block has invalid data and can’t be displayed.
      </p>
    );
  }

  switch (parsed.type) {
    case "MARKDOWN":
      return <MarkdownRenderer markdown={parsed.data.markdown} />;
    case "EQUATION":
      return <EquationRenderer latex={parsed.data.latex} display={parsed.data.display} />;
    case "CODE_SNIPPET":
      return <CodeSnippetRenderer language={parsed.data.language} code={parsed.data.code} />;
    case "FILE_ATTACHMENT":
      return (
        <FileAttachmentRenderer
          blockId={parsed.id}
          fileName={parsed.data.fileName}
          sizeBytes={parsed.data.sizeBytes}
        />
      );
    default: {
      const _exhaustive: never = parsed;
      return _exhaustive;
    }
  }
}
