import type { Database } from "../../database/index.ts"
import type { OpenRouterClientConfig } from "./OpenRouterClientConfig.ts"
import { parseOpenRouterClientConfig } from "./parseOpenRouterClientConfig.ts"

export async function readOpenRouterClientConfig(
  database: Database,
): Promise<OpenRouterClientConfig> {
  const value = await database.providers.get("openrouter")
  if (value === undefined) {
    throw new Error(
      "[readOpenRouterClientConfig] provider config not found: openrouter",
    )
  }

  return parseOpenRouterClientConfig(value)
}
