import Path from "node:path"
import { assertId } from "../../../database/id.ts"
import type { Database } from "../../../database/index.ts"
import { readJsonFile } from "../../../database/index.ts"
import type { ModelConfig } from "./ModelConfig.ts"
import { parseModelConfig } from "./parseModelConfig.ts"

export async function readModelConfig(
  database: Database,
  name: string,
): Promise<ModelConfig> {
  const value = await readJsonFile(modelConfigPath(database, name))
  if (value === undefined) {
    throw new Error(
      `[readModelConfig] model config not found: deepseek/${name}`,
    )
  }

  return parseModelConfig(name, value)
}

function modelConfigPath(database: Database, name: string): string {
  assertId(name)
  return Path.join(database.providersRoot, "deepseek", "models", `${name}.json`)
}
