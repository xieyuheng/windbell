import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { writeJsonFile } from "../../../database/index.ts"
import { parseModelConfig } from "./parseModelConfig.ts"
import { readModelConfigs } from "./readModelConfigs.ts"

export async function disableModel(
  database: Database,
  name: string,
): Promise<boolean> {
  const configs = await readModelConfigs(database)

  if (!Object.hasOwn(configs, name)) return false

  const config = parseModelConfig(name, configs[name])
  if (config.disabled) return false

  configs[name] = {
    ...(configs[name] as Record<string, unknown>),
    disabled: true,
  }

  await writeJsonFile(modelConfigsPath(database), configs)
  return true
}

function modelConfigsPath(database: Database): string {
  return Path.join(database.providersRoot, "deepseek", "models.json")
}
