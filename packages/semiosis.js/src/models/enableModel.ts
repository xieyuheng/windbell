import type { Database } from "../database/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
import * as OpenRouter from "../providers/openrouter/index.ts"

export async function enableModel(
  database: Database,
  providerName: string,
  name: string,
): Promise<void> {
  switch (providerName) {
    case "deepseek": {
      await DeepSeek.enableModel(database, name)
      return
    }

    case "openrouter": {
      await OpenRouter.enableModel(database, name)
      return
    }

    default: {
      throw new Error(`unknown provider: ${providerName}`)
    }
  }
}
