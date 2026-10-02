import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { readJsonFile } from "../../../database/index.ts"

export async function readModelConfigs(
  database: Database,
): Promise<Record<string, unknown>> {
  const value = await readJsonFile(modelConfigsPath(database))
  if (value === undefined) return {}

  if (typeof value !== "object" || value === null || value instanceof Array) {
    throw new Error("[readModelConfigs] invalid model configs file")
  }

  return value as Record<string, unknown>
}

function modelConfigsPath(database: Database): string {
  return Path.join(database.providersRoot, "openrouter", "models.json")
}
