import type { Database } from "../../../database/index.ts"
import { readApiKey } from "../../../database/index.ts"
import type { ClientConfig } from "./ClientConfig.ts"

export async function readClientConfig(
  database: Database,
): Promise<ClientConfig> {
  const providerInfo = await database.providers.get("openrouter")
  if (providerInfo === undefined) {
    throw new Error("[readClientConfig] provider info not found: openrouter")
  }

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
