import type { Database } from "../database/index.ts"
import {
  makeDeepSeekClient,
  readDeepSeekClientConfig,
} from "../clients/deepseek/index.ts"
import type { Model } from "../model/index.ts"
import { makeDeepSeekModel } from "./deepseek/makeDeepSeekModel.ts"
import { readDeepSeekModelConfig } from "./deepseek/readDeepSeekModelConfig.ts"
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
      const client = makeDeepSeekClient(
        await readDeepSeekClientConfig(options.database),
      )
      const config = await readDeepSeekModelConfig(options.database, modelName)
      return makeDeepSeekModel(client, config)
    }

    default:
      throw new Error(`unknown provider: ${providerName}`)
  }
}

function parseQualifiedName(text: string): [string, string] {
  const [providerName, modelName, ...rest] = text.split("/")
  if (
    providerName === undefined ||
    modelName === undefined ||
    providerName === "" ||
    modelName === "" ||
    rest.length !== 0
  ) {
    throw new Error(
      `invalid qualifiedName: ${text}, expected <provider-name>/<model-name>`,
    )
  }

  return [providerName, modelName]
}
