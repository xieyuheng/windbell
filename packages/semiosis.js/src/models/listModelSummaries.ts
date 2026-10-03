import type { Database } from "../database/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
import * as OpenRouter from "../providers/openrouter/index.ts"
import { isModelEnabled } from "./isModelEnabled.ts"

export type ModelSummary = {
  name: string
  enabled: boolean
}

export async function listModelSummaries(
  database: Database,
  providerName: string,
): Promise<Array<ModelSummary>> {
  const names = await listModelNames(database, providerName)
  const summaries: Array<ModelSummary> = []

  for (const name of names) {
    summaries.push({
      name,
      enabled: await isModelEnabled(database, providerName, name),
    })
  }

  return summaries
}

async function listModelNames(
  database: Database,
  providerName: string,
): Promise<Array<string>> {
  switch (providerName) {
    case "deepseek": {
      const configs = await DeepSeek.readModelConfigs(database)
      return Object.keys(configs).sort()
    }

    case "openrouter": {
      const configs = await OpenRouter.readModelConfigs(database)
      return Object.keys(configs).sort()
    }

    default: {
      throw new Error(`unknown provider: ${providerName}`)
    }
  }
}
