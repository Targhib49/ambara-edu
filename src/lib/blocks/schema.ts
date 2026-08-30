import { z } from "zod";
import { BlockType } from "@/generated/prisma/enums";
import { defaultVisualizationData, visualizationDataSchema } from "@/lib/viz/schemas";
import { VIDEO_URL_HINT, parseVideoUrl } from "@/lib/blocks/video";

/**
 * The single registration point for content block data shapes.
 *
 * Adding a new block type (CODE_EDITOR, VISUALIZATION, QUIZ_REF, ...) means:
 *   1. append the value to the BlockType enum in prisma/schema.prisma + migrate
 *   2. add its Zod schema here — the `satisfies` clause makes the compiler
 *      flag every other place that needs a case (renderer/editor registries)
 */
export const blockDataSchemas = {
  MARKDOWN: z.object({
    markdown: z.string(),
  }),
  EQUATION: z.object({
    latex: z.string(),
    display: z.boolean().default(true),
  }),
  CODE_SNIPPET: z.object({
    language: z.string().min(1),
    code: z.string(),
  }),
  FILE_ATTACHMENT: z.object({
    storagePath: z.string().min(1),
    fileName: z.string().min(1),
    mimeType: z.string(),
    sizeBytes: z.number().int().nonnegative(),
    // How the student sees it. Absent on blocks created before this existed —
    // `effectiveFileDisplay` below picks the sensible default from the mime type.
    display: z.enum(["download", "inline"]).optional(),
  }),
  CODE_EDITOR: z.object({
    starterCode: z.string(),
  }),
  VISUALIZATION: visualizationDataSchema,
  VIDEO_EMBED: z.object({
    // Empty is allowed so a freshly added block can be saved to the DB before
    // the tutor has pasted anything; the renderer shows a placeholder for it.
    url: z.string().refine((u) => u === "" || parseVideoUrl(u) !== null, VIDEO_URL_HINT),
    caption: z.string().default(""),
  }),
} as const satisfies Record<BlockType, z.ZodType>;

export type BlockDataMap = {
  [K in BlockType]: z.infer<(typeof blockDataSchemas)[K]>;
};

/** Discriminated union of all block payloads. */
export type AnyBlock = {
  [K in BlockType]: { id: string; type: K; data: BlockDataMap[K] };
}[BlockType];

/** Default payloads for freshly created blocks (FILE_ATTACHMENT is created via upload instead). */
export const defaultBlockData: { [K in Exclude<BlockType, "FILE_ATTACHMENT">]: BlockDataMap[K] } = {
  MARKDOWN: { markdown: "" },
  EQUATION: { latex: "", display: true },
  CODE_SNIPPET: { language: "python", code: "" },
  CODE_EDITOR: { starterCode: 'print("Hello from Python!")\n' },
  VISUALIZATION: defaultVisualizationData,
  VIDEO_EMBED: { url: "", caption: "" },
};

/**
 * PDFs and images are worth showing in place; everything else (docx, zip,
 * datasets) is a download. A tutor can override either way per block.
 */
export function effectiveFileDisplay(data: BlockDataMap["FILE_ATTACHMENT"]): "download" | "inline" {
  if (data.display) return data.display;
  return isPreviewableFile(data) ? "inline" : "download";
}

export function isPreviewableFile(data: { mimeType: string; fileName: string }): boolean {
  return isPdfFile(data) || data.mimeType.startsWith("image/");
}

export function isPdfFile(data: { mimeType: string; fileName: string }): boolean {
  return data.mimeType === "application/pdf" || data.fileName.toLowerCase().endsWith(".pdf");
}

export function parseBlockData<K extends BlockType>(type: K, data: unknown): BlockDataMap[K] {
  return blockDataSchemas[type].parse(data) as BlockDataMap[K];
}

export function toAnyBlock(block: { id: string; type: BlockType; data: unknown }): AnyBlock {
  return {
    id: block.id,
    type: block.type,
    data: parseBlockData(block.type, block.data),
  } as AnyBlock;
}
