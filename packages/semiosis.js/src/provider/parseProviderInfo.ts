import { z } from "zod"
import type { ProviderInfo } from "./ProviderInfo.ts"

const providerInfoSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().min(1),
  defaultModel: z.string().min(1).nullable().optional().default(null),
})

export function parseProviderInfo(value: unknown): ProviderInfo {
  const result = providerInfoSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseProviderInfo] invalid provider info: ${result.error.message}`,
    )
  }

  return result.data
}
