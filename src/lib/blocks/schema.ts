import { z } from "zod";
import { BlockType } from "@/generated/prisma/enums";

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
};

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
