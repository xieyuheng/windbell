import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { writeJsonFile } from "../../../database/index.ts"
import { parseModelConfig } from "./parseModelConfig.ts"
import { readModelConfigs } from "./readModelConfigs.ts"

export async function enableModel(
  database: Database,
  name: string,
): Promise<void> {
  const configs = await readModelConfigs(database)

  if (Object.hasOwn(configs, name)) {
    const config = parseModelConfig(name, configs[name])
    if (!config.disabled) return

    configs[name] = {
      ...(configs[name] as Record<string, unknown>),
      disabled: false,
    }
  } else {
    configs[name] = { disabled: false }
  }

  await writeJsonFile(modelConfigsPath(database), configs)
}

function modelConfigsPath(database: Database): string {
  return Path.join(database.providersRoot, "deepseek", "models.json")
}
