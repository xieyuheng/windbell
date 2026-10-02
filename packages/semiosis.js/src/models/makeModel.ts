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
