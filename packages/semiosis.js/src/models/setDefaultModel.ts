import type { Database } from "../database/index.ts"
import { readProviderConfig } from "../provider/index.ts"
import { providerNames } from "../providers/providerNames.ts"
import { isModelEnabled } from "./isModelEnabled.ts"

export async function setDefaultModel(
  database: Database,
  providerName: string,
  name: string,
): Promise<void> {
  if (!(providerNames as readonly string[]).includes(providerName)) {
    throw new Error(`unsupported provider: ${providerName}`)
  }

  const providerConfig = await readProviderConfig(database, providerName)

  if (!(await isModelEnabled(database, providerName, name))) {
    throw new Error(`model is not enabled: ${providerName}/${name}`)
  }

  await database.providers.put(providerName, {
    ...providerConfig,
    defaultModel: name,
  })
}
