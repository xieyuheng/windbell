import { z } from "zod"
import type { ModelListOutput } from "./ModelListOutput.ts"

const modelInfoSchema = z.object({
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

const modelListOutputSchema = z.object({
  object: z.literal("list"),
  data: z.array(modelInfoSchema),
})

export function parseModelListOutput(text: string): ModelListOutput {
  const value = parseJson(text)
  const result = modelListOutputSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseModelListOutput] invalid output: ${result.error.message}`,
    )
  }

  return result.data
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[parseModelListOutput] invalid JSON: ${message}`)
  }
}
