import Path from "node:path"
import type { Database } from "../../../database/index.ts"
import { readApiKey, readJsonFile } from "../../../database/index.ts"
import { parseProviderInfo } from "../../../provider/index.ts"
import type { ClientConfig } from "./ClientConfig.ts"

export async function readClientConfig(
  database: Database,
): Promise<ClientConfig> {
  const value = await readJsonFile(providerInfoPath(database))
  if (value === undefined) {
    throw new Error("[readClientConfig] provider info not found: openrouter")
  }

  const providerInfo = parseProviderInfo(value)
  if (providerInfo.name !== "openrouter") {
    throw new Error(
      `[readClientConfig] provider name mismatch: expected openrouter, got ${providerInfo.name}`,
    )
  }

  const key = await readApiKey(database, "openrouter")

  return {
    baseUrl: providerInfo.baseUrl,
    key,
  }
}

function providerInfoPath(database: Database): string {
  return Path.join(database.providersRoot, "openrouter", "index.json")
}
