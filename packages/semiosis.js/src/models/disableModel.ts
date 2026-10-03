import type { Database } from "../database/index.ts"
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

  const providerInfo = await database.providers.get(providerName)
  if (providerInfo !== undefined && providerInfo.defaultModel === name) {
    await database.providers.put(providerName, {
      ...providerInfo,
      defaultModel: null,
    })
  }

  return true
}
