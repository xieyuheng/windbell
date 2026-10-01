import { z } from "zod"
import type { OpenRouterClientConfig } from "./OpenRouterClientConfig.ts"

const openRouterClientConfigSchema = z.object({
  baseUrl: z.string().min(1),
  key: z.string().min(1),
})

export function parseOpenRouterClientConfig(
  value: unknown,
): OpenRouterClientConfig {
  const result = openRouterClientConfigSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseOpenRouterClientConfig] invalid client config: ${result.error.message}`,
    )
  }

  return result.data
}
