import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { readApiKey, readJsonFile } from "../../../database/index.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import { parseProviderConfig } from "./parseProviderConfig.ts"

export async function readClientConfig(
  database: Database,
): Promise<ClientConfig> {
  const value = await readJsonFile(providerConfigPath(database))
  if (value === undefined) {
    throw new Error("[readClientConfig] provider config not found: deepseek")
  }

  const providerConfig = parseProviderConfig(value)
  const key = await readApiKey(database, "deepseek")

  return {
    baseUrl: providerConfig.baseUrl,
    key,
  }
}

function providerConfigPath(database: Database): string {
  return Path.join(database.providersRoot, "deepseek", "index.json")
}
