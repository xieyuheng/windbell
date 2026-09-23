import type { Database } from "../../database/index.ts"
import type { DeepSeekModelConfig } from "./DeepSeekModelConfig.ts"
import { parseDeepSeekModelConfig } from "./parseDeepSeekModelConfig.ts"

export async function readDeepSeekModelConfig(
  database: Database,
  name: string,
): Promise<DeepSeekModelConfig> {
  const value = await database.models.get("deepseek", name)
  if (value === undefined) {
    throw new Error(
      `[readDeepSeekModelConfig] model config not found: deepseek/${name}`,
    )
  }

  return parseDeepSeekModelConfig(name, value)
}
