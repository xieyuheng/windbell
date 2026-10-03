import type { Database } from "../database/index.ts"
import { providerNames } from "../providers/providerNames.ts"

export async function setDefaultProvider(
  database: Database,
  providerName: string,
): Promise<void> {
  if (!(providerNames as readonly string[]).includes(providerName)) {
    throw new Error(`unsupported provider: ${providerName}`)
  }

  const providerInfo = await database.providers.get(providerName)
  if (providerInfo === undefined) {
    throw new Error(`provider not found: ${providerName}`)
  }

  const settings = await database.settings.get()

  await database.settings.put({
    ...(settings ?? { defaultProvider: null }),
    defaultProvider: providerName,
  })
}
