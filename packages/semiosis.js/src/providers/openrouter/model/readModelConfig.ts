import type { Database } from "../../../database/index.ts"
import type { ModelConfig } from "./ModelConfig.ts"
import { parseModelConfig } from "./parseModelConfig.ts"
import { readModelConfigs } from "./readModelConfigs.ts"

export async function readModelConfig(
  database: Database,
  name: string,
): Promise<ModelConfig> {
  const configs = await readModelConfigs(database)
  if (!Object.hasOwn(configs, name)) {
    throw new Error(
      `[readModelConfig] model config not found: openrouter/${name}`,
    )
  }

  return parseModelConfig(name, configs[name])
}
