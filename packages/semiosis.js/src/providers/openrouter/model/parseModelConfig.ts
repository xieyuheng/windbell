import { z } from "zod"
import type { ModelConfig } from "./ModelConfig.ts"

const reasoningSchema = z.object({
  effort: z.string().optional(),
  max_tokens: z.number().optional(),
  exclude: z.boolean().optional(),
  enabled: z.boolean().optional(),
})

const modelConfigSchema = z.object({
  reasoning: reasoningSchema.nullable().optional(),
  provider: z.record(z.string(), z.unknown()).nullable().optional(),
  extraBody: z.record(z.string(), z.unknown()).optional(),
})

export function parseModelConfig(name: string, value: unknown): ModelConfig {
  const result = modelConfigSchema.safeParse(value ?? {})
  if (!result.success) {
    throw new Error(
      `[parseModelConfig] invalid model config: ${result.error.message}`,
    )
  }

  return {
    name,
    ...result.data,
  }
}
