import type { Database } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
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
