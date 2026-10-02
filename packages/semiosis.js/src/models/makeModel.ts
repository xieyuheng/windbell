import type { Database } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
import * as OpenRouter from "../providers/openrouter/index.ts"
import { readMockModel } from "./readMockModel.ts"

export type MakeModelOptions = {
  database: Database
}

export async function makeModel(
  qualifiedName: string,
  options: MakeModelOptions,
): Promise<Model> {
  const [providerName, modelName] = parseQualifiedName(qualifiedName)

  switch (providerName) {
    case "mock": {
      return readMockModel(modelName)
    }

    case "deepseek": {
      const client = DeepSeek.makeClient(
        await DeepSeek.readClientConfig(options.database),
      )
      const config = await DeepSeek.readModelConfig(options.database, modelName)
      return DeepSeek.makeModel(client, config)
    }

    case "openrouter": {
      const client = OpenRouter.makeClient(
        await OpenRouter.readClientConfig(options.database),
      )
      const config = await OpenRouter.readModelConfig(
        options.database,
        modelName,
      )
      return OpenRouter.makeModel(client, config)
    }

    default:
      throw new Error(`unknown provider: ${providerName}`)
  }
}

function parseQualifiedName(text: string): [string, string] {
  const index = text.indexOf("/")
  if (index <= 0 || index === text.length - 1) {
    throw new Error(
      `invalid qualifiedName: ${text}, expected <provider-name>/<model-name>`,
    )
  }

  const providerName = text.slice(0, index)
  const modelName = text.slice(index + 1)

  if (providerName === "" || modelName === "") {
    throw new Error(
      `invalid qualifiedName: ${text}, expected <provider-name>/<model-name>`,
    )
  }

  return [providerName, modelName]
}

export async function readDefaultModelQualifiedName(
  database: Database,
): Promise<string | undefined> {
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

  return `${providerName}/${providerInfo.defaultModel}`
}
