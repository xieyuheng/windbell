import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { writeJsonFile } from "../../../database/index.ts"
import { readModelConfigs } from "./readModelConfigs.ts"

export async function enableModel(
  database: Database,
  name: string,
): Promise<void> {
  const configs = await readModelConfigs(database)

  if (Object.hasOwn(configs, name)) return

  configs[name] = {}
  await writeJsonFile(modelConfigsPath(database), configs)
}

function modelConfigsPath(database: Database): string {
  return Path.join(database.providersRoot, "deepseek", "models.json")
}
