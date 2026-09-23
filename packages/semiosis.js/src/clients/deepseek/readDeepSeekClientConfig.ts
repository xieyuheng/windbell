import type { Database } from "../../database/index.ts"
import type { DeepSeekClientConfig } from "./DeepSeekClientConfig.ts"
import { parseDeepSeekClientConfig } from "./parseDeepSeekClientConfig.ts"

export async function readDeepSeekClientConfig(
  database: Database,
): Promise<DeepSeekClientConfig> {
  const value = await database.providers.get("deepseek")
  if (value === undefined) {
    throw new Error(
      "[readDeepSeekClientConfig] provider config not found: deepseek",
    )
  }

  return parseDeepSeekClientConfig(value)
}
