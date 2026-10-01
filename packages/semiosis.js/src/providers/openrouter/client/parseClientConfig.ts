import { z } from "zod"
import type { ClientConfig } from "./ClientConfig.ts"

const clientConfigSchema = z.object({
  baseUrl: z.string().min(1),
  key: z.string().min(1),
})

export function parseClientConfig(value: unknown): ClientConfig {
  const result = clientConfigSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseClientConfig] invalid client config: ${result.error.message}`,
    )
  }

  return result.data
}
