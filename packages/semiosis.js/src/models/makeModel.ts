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
  providerName: string
  modelName: string
}

export async function makeModel(options: MakeModelOptions): Promise<Model> {
  switch (options.providerName) {
    case "mock": {
      return readMockModel(options.modelName)
    }

    case "deepseek": {
      const client = makeDeepSeekClient(
        await readDeepSeekClientConfig(options.database),
      )
      const config = await readDeepSeekModelConfig(
        options.database,
        options.modelName,
      )
      return makeDeepSeekModel(client, config)
    }

    default:
      throw new Error(`unknown provider: ${options.providerName}`)
  }
}
