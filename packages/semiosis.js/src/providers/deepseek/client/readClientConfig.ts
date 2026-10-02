import type { Database } from "../../../database/index.ts"
import { readApiKey } from "../../../database/index.ts"
import type { ClientConfig } from "./ClientConfig.ts"

export async function readClientConfig(
  database: Database,
): Promise<ClientConfig> {
  const providerInfo = await database.providers.get("deepseek")
  if (providerInfo === undefined) {
    throw new Error("[readClientConfig] provider info not found: deepseek")
  }

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
