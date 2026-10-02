import type { Database } from "../database/index.ts"
import type { Model, ModelRef } from "../model/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
import * as OpenRouter from "../providers/openrouter/index.ts"
import { readMockModel } from "./readMockModel.ts"

export type MakeModelOptions = {
  database: Database
}

export async function makeModel(
  ref: ModelRef,
  options: MakeModelOptions,
): Promise<Model> {
  switch (ref.providerName) {
    case "mock": {
      return readMockModel(ref.name)
    }

    case "deepseek": {
      const client = DeepSeek.makeClient(
        await DeepSeek.readClientConfig(options.database),
      )
      const config = await DeepSeek.readModelConfig(options.database, ref.name)
      return DeepSeek.makeModel(client, config)
    }

    case "openrouter": {
      const client = OpenRouter.makeClient(
        await OpenRouter.readClientConfig(options.database),
      )
      const config = await OpenRouter.readModelConfig(
        options.database,
        ref.name,
      )
      return OpenRouter.makeModel(client, config)
    }

    default:
      throw new Error(`unknown provider: ${ref.providerName}`)
  }
}

export async function readDefaultModelRef(
  database: Database,
): Promise<ModelRef | undefined> {
  const settings = await database.settings.get()
  const providerName = settings?.defaultProvider

  if (providerName === undefined || providerName === null) {
    return undefined
  }

  const providerInfo = await database.providers.get(providerName)
  if (providerInfo === undefined) {
    throw new Error(`unknown provider: ${providerName}`)
  }

  if (providerInfo.name !== providerName) {
    throw new Error(
      `provider name mismatch: expected ${providerName}, got ${providerInfo.name}`,
    )
  }

  if (providerInfo.defaultModel === null) {
    return undefined
  }

  return {
    providerName,
    name: providerInfo.defaultModel,
  }
}
