import { z } from "zod"
import type { DeepSeekClientConfig } from "./DeepSeekClientConfig.ts"

const deepSeekClientConfigSchema = z.object({
  baseUrl: z.string().min(1),
  key: z.string().min(1),
})

export function parseDeepSeekClientConfig(
  value: unknown,
): DeepSeekClientConfig {
  const result = deepSeekClientConfigSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseDeepSeekClientConfig] invalid client config: ${result.error.message}`,
    )
  }

  return result.data
}
