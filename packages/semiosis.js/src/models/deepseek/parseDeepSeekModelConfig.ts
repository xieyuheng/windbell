import { z } from "zod"
import type { DeepSeekModelConfig } from "./DeepSeekModelConfig.ts"

const deepSeekModelConfigSchema = z.object({
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

export function parseDeepSeekModelConfig(
  name: string,
  value: unknown,
): DeepSeekModelConfig {
  const result = deepSeekModelConfigSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseDeepSeekModelConfig] invalid model config: ${result.error.message}`,
    )
  }

  return {
    name,
    ...result.data,
  }
}
