import type { Database } from "../../database/index.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import { parseClientConfig } from "./parseClientConfig.ts"

export async function readClientConfig(
  database: Database,
): Promise<ClientConfig> {
  const value = await database.providers.get("openrouter")
  if (value === undefined) {
    throw new Error("[readClientConfig] provider config not found: openrouter")
  }

  return parseClientConfig(value)
}
