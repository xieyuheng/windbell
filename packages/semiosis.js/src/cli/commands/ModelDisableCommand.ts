import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { disableModel } from "../../models/index.ts"
import { readOptionalOption } from "../options.ts"

export type ModelDisableCommandOptions = {
  database: Database
}

export function makeModelDisableHandler(options: ModelDisableCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const modelName = context.argValues["model-name"]

    if (modelName === undefined) {
      throw new Error("expected command: model disable <model-name>")
    }

    const providerOption = readOptionalOption(context.options, "--provider")
    const settings = await options.database.settings.get()
    const providerName = providerOption ?? settings?.defaultProvider

    if (providerName === undefined || providerName === null) {
      throw new Error("default provider is not configured")
    }

    const providerInfo = await options.database.providers.get(providerName)
    const wasDefaultModel = providerInfo?.defaultModel === modelName

    const disabled = await disableModel(
      options.database,
      providerName,
      modelName,
    )

    if (!disabled) {
      console.log(`model not enabled: ${providerName}/${modelName}`)
      return
    }

    console.log(`disabled: ${providerName}/${modelName}`)

    if (wasDefaultModel) {
      console.log(`default model cleared: ${providerName}/${modelName}`)
    }
  }
}
