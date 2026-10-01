import { z } from "zod"
import type { DeepSeekModelListOutput } from "./DeepSeekModelListOutput.ts"

const deepSeekModelInfoSchema = z.object({
  id: z.string(),
  object: z.literal("model"),
  owned_by: z.string(),
  name: z.string(),
  context_window: z.number(),
  max_output_tokens: z.number(),
  input_modalities: z.array(z.string()),
  output_modalities: z.array(z.string()),
  effort: z
    .object({
      supported_levels: z.array(z.string()),
      default_level: z.string().optional(),
    })
    .optional(),
  api_capabilities: z.record(z.string(), z.unknown()).optional(),
})

const deepSeekModelListOutputSchema = z.object({
  object: z.literal("list"),
  data: z.array(deepSeekModelInfoSchema),
})

export function parseDeepSeekModelListOutput(
  text: string,
): DeepSeekModelListOutput {
  const value = parseDeepSeekJson(text)
  const result = deepSeekModelListOutputSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseDeepSeekModelListOutput] invalid output: ${result.error.message}`,
    )
  }

  return result.data
}

function parseDeepSeekJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[parseDeepSeekModelListOutput] invalid JSON: ${message}`)
  }
}
