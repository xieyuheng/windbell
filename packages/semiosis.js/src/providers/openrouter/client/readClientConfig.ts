import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { readJsonFile } from "../../../database/index.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import { parseClientConfig } from "./parseClientConfig.ts"

export async function readClientConfig(
  database: Database,
): Promise<ClientConfig> {
  const value = await readJsonFile(clientConfigPath(database))
  if (value === undefined) {
    throw new Error("[readClientConfig] provider config not found: openrouter")
  }

  return parseClientConfig(value)
}

function clientConfigPath(database: Database): string {
  return Path.join(database.providersRoot, "openrouter", "index.json")
}
