import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { enableModel } from "../../models/index.ts"
import { readOptionalOption } from "../options.ts"

export type ModelEnableCommandOptions = {
  database: Database
}

export function makeModelEnableHandler(options: ModelEnableCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const [modelName] = context.args

    if (typeof modelName !== "string") {
      throw new Error("expected command: model-enable <model-name>")
    }

    const providerOption = readOptionalOption(context.options, "--provider")
    const settings = await options.database.settings.get()
    const providerName = providerOption ?? settings?.defaultProvider

    if (providerName === undefined || providerName === null) {
      throw new Error("default provider is not configured")
    }

    await enableModel(options.database, providerName, modelName)
    console.log(`enabled: ${providerName}/${modelName}`)
  }
}
