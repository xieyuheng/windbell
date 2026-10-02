import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { listFiles } from "../../../database/index.ts"
import { isValidId } from "../../../database/id.ts"

export async function listModelConfigs(
  database: Database,
): Promise<Array<string>> {
  const fileNames = await listFiles(modelsDir(database))
  const modelNames: Array<string> = []

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".json")) continue

    const modelName = fileName.slice(0, -".json".length)
    if (!isValidId(modelName)) continue

    modelNames.push(modelName)
  }

  modelNames.sort()
  return modelNames
}

function modelsDir(database: Database): string {
  return Path.join(database.providersRoot, "deepseek", "models")
}
