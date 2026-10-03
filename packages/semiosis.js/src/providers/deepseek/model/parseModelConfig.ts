import { z } from "zod"
import type { ModelConfig } from "./ModelConfig.ts"

const modelConfigSchema = z.object({
  disabled: z.boolean().default(false),
  thinking: z
    .union([z.literal("enabled"), z.literal("disabled")])
    .default("enabled"),
  reasoningEffort: z
    .union([
      z.literal("none"),
      z.literal("low"),
      z.literal("high"),
      z.literal("max"),
    ])
    .default("high"),
})

export function parseModelConfig(name: string, value: unknown): ModelConfig {
  const result = modelConfigSchema.safeParse(value)
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
