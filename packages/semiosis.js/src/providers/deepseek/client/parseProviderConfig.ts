import { z } from "zod"
import type { ProviderConfig } from "./ProviderConfig.ts"

const providerConfigSchema = z.object({
  baseUrl: z.string().min(1),
})

export function parseProviderConfig(value: unknown): ProviderConfig {
  const result = providerConfigSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseProviderConfig] invalid provider config: ${result.error.message}`,
    )
  }

  return result.data
}
