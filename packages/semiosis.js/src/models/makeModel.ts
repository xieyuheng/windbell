import {
  makeDeepSeekClient,
  readDeepSeekClientConfig,
} from "../clients/deepseek/index.ts"
import type { Model } from "../model/index.ts"
import { makeDeepSeekModel } from "./deepseek/makeDeepSeekModel.ts"
import { readMockModel } from "./readMockModel.ts"
import { readDeepSeekModelConfig } from "./deepseek/readDeepSeekModelConfig.ts"

export function makeModel(providerName: string, modelName: string): Model {
  switch (providerName) {
    case "mock": {
      return readMockModel(modelName)
    }

    case "deepseek": {
      const client = makeDeepSeekClient(readDeepSeekClientConfig())
      const config = readDeepSeekModelConfig(modelName)
      return makeDeepSeekModel(client, config)
    }

    default:
      throw new Error(`unknown provider: ${providerName}`)
  }
}
