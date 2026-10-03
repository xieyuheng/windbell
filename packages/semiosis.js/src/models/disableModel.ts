import type { Database } from "../database/index.ts"
import { readProviderConfig } from "../provider/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
import * as OpenRouter from "../providers/openrouter/index.ts"

export async function disableModel(
  database: Database,
  providerName: string,
  name: string,
): Promise<boolean> {
  let disabled: boolean

  switch (providerName) {
    case "deepseek": {
      disabled = await DeepSeek.disableModel(database, name)
      break
    }

    case "openrouter": {
      disabled = await OpenRouter.disableModel(database, name)
      break
    }

    default: {
      throw new Error(`unknown provider: ${providerName}`)
    }
  }

  if (!disabled) return false

  const providerConfig = await readProviderConfig(database, providerName)
  if (providerConfig.defaultModel === name) {
    await database.providers.put(providerName, {
      ...providerConfig,
      defaultModel: null,
    })
  }

  return true
}
