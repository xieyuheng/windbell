import { errorReport } from "@xieyuheng/std.js/error"
import type { Client } from "../client/index.ts"
import type { Model } from "../../../model/index.ts"
import { ErrorSign } from "../../../sign/index.ts"
import { interpret } from "./interpret.ts"
import type { ModelConfig } from "./ModelConfig.ts"

export function makeModel(client: Client, config: ModelConfig): Model {
  return {
    providerName: "deepseek",
    name: config.name,
    interpret: async (input) => {
      try {
        return await interpret(client, config, input)
      } catch (error) {
        return [ErrorSign(`[makeModel] ${errorReport(error)}`)]
      }
    },
  }
}
