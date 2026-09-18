import ReactMarkdown from "react-markdown";
import { getT } from "@/lib/i18n/server";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import { codeToHtml } from "shiki";
import type { AnyBlock, BlockDataMap } from "@/lib/blocks/schema";
import { effectiveFileDisplay, isPdfFile, toAnyBlock } from "@/lib/blocks/schema";
import { parseVideoUrl } from "@/lib/blocks/video";
import type { BlockType } from "@/generated/prisma/enums";
import { CodeEditorBlock } from "./CodeEditorBlock";
import { VizBlock } from "@/components/viz/VizBlock";
import { PdfFlipViewer } from "./PdfFlipViewer";

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

const fileBtn =
  "items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-100";

/** Compact download row — the shape used for anything we don't preview in place. */
async function FileDownloadRow({
  blockId,
  fileName,
  sizeBytes,
}: {
  blockId: string;
  fileName: string;
  sizeBytes: number;
}) {
  const t = await getT();
  return (
    <a
      href={`/api/files/${blockId}`}
      className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-300 hover:bg-zinc-50"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden className="text-lg">📎</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-zinc-900 group-hover:text-blue-700">
          {fileName}
        </span>
        <span className="block text-xs text-zinc-500">{formatBytes(sizeBytes)}</span>
      </span>
      <span className="shrink-0 text-xs font-medium text-blue-700">{t("file.download")}</span>
    </a>
  );
}

/**
 * In-page PDF reader. The pages are fetched through the access-checked route,
 * so the signed URL stays short-lived and enrollment-gated, and drawn by
 * pdf.js — see PdfFlipViewer for why it isn't the browser's own viewer in a
 * frame. The header keeps the open-in-a-tab and download links either way.
 */
function PdfViewer({
  blockId,
  fileName,
  sizeBytes,
}: {
  blockId: string;
  fileName: string;
  sizeBytes: number;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <figcaption className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-2.5">
        <span aria-hidden>📄</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-900">{fileName}</span>
          <span className="block text-xs whitespace-nowrap text-zinc-500">
            PDF · {formatBytes(sizeBytes)}
          </span>
        </span>
        {/* Redundant on phones, where the whole card body is an open-in-a-tab
            button — dropping it leaves room for the file name. */}
        <a
          href={`/api/files/${blockId}?inline=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden sm:inline-flex ${fileBtn}`}
        >
          Open ↗
        </a>
        <a
          href={`/api/files/${blockId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex ${fileBtn}`}
        >
          Download ↓
        </a>
      </figcaption>
      <PdfFlipViewer blockId={blockId} fileName={fileName} />
    </figure>
  );
}

function ImagePreview({
  blockId,
  fileName,
  sizeBytes,
}: {
  blockId: string;
  fileName: string;
  sizeBytes: number;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Signed, short-lived storage URL behind a redirect — not a static asset
          next/image can optimize, so a plain img is the right call here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/files/${blockId}?inline=1`} alt={fileName} className="max-h-[70vh] w-full bg-zinc-50 object-contain" />
      <figcaption className="flex flex-wrap items-center gap-2 border-t border-zinc-100 px-4 py-2.5">
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
          {fileName} · {formatBytes(sizeBytes)}
        </span>
        <a
          href={`/api/files/${blockId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex ${fileBtn}`}
        >
          Download ↓
        </a>
      </figcaption>
    </figure>
  );
}

function FileAttachmentRenderer({
  blockId,
  data,
}: {
  blockId: string;
  data: BlockDataMap["FILE_ATTACHMENT"];
}) {
  const props = { blockId, fileName: data.fileName, sizeBytes: data.sizeBytes };
  if (effectiveFileDisplay(data) === "inline") {
    if (isPdfFile(data)) return <PdfViewer {...props} />;
    if (data.mimeType.startsWith("image/")) return <ImagePreview {...props} />;
  }
  return <FileDownloadRow {...props} />;
}

async function VideoEmbedRenderer({ url, caption }: { url: string; caption: string }) {
  const t = await getT();
  const video = url ? parseVideoUrl(url) : null;
  if (!video) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
        {url ? t("video.unrecognised") : t("video.none")}
      </p>
    );
  }
  return (
    <figure className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-black shadow-sm">
        <iframe
          src={video.embedUrl}
          title={caption || t("video.iframeTitle")}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {caption && <figcaption className="text-sm text-zinc-500">{caption}</figcaption>}
    </figure>
  );
}

/**
 * Server component: validates the raw JSON payload and dispatches to the
 * type-specific renderer. New block types get a case here (the switch is
 * exhaustive over BlockType, so the compiler flags omissions).
 */
export async function BlockRenderer({
  block,
}: {
  block: { id: string; type: BlockType; data: unknown };
}) {
  let parsed: AnyBlock;
  try {
    parsed = toAnyBlock(block);
  } catch {
    return (
      <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">{(await getT())("block.invalid")}</p>
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
      return <FileAttachmentRenderer blockId={parsed.id} data={parsed.data} />;
    case "VIDEO_EMBED":
      return <VideoEmbedRenderer url={parsed.data.url} caption={parsed.data.caption} />;
    case "CODE_EDITOR":
      // Keyed on the starter code so a tutor's save remounts the preview with
      // the fresh doc (the component itself ignores prop changes after mount).
      return <CodeEditorBlock key={parsed.data.starterCode} starterCode={parsed.data.starterCode} />;
    case "VISUALIZATION":
      // Same remount-on-save pattern: viz components seed state from props.
      return <VizBlock key={JSON.stringify(parsed.data)} data={parsed.data} />;
    default: {
      const _exhaustive: never = parsed;
      return _exhaustive;
    }
  }
}
