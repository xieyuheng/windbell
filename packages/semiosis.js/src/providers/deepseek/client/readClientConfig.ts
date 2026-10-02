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
    throw new Error("[readClientConfig] provider info not found: deepseek")
  }

  const providerInfo = parseProviderInfo(value)
  if (providerInfo.name !== "deepseek") {
    throw new Error(
      `[readClientConfig] provider name mismatch: expected deepseek, got ${providerInfo.name}`,
    )
  }

  const key = await readApiKey(database, "deepseek")

  return {
    baseUrl: providerInfo.baseUrl,
    key,
  }
}

function providerInfoPath(database: Database): string {
  return Path.join(database.providersRoot, "deepseek", "index.json")
}
