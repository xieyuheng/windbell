import type { Database } from "../../../database/index.ts"
import type { ModelConfig } from "./ModelConfig.ts"
import { parseModelConfig } from "./parseModelConfig.ts"

export async function readModelConfig(
  database: Database,
  name: string,
): Promise<ModelConfig> {
  const value = await database.models.get("deepseek", name)
  if (value === undefined) {
    throw new Error(
      `[readModelConfig] model config not found: deepseek/${name}`,
    )
  }

  return parseModelConfig(name, value)
}
