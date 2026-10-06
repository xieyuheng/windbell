import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import {
  isModelPinned,
  listAvailableModels,
  listModelConfigs,
} from "../../models/index.ts"
import { readProviderConfig } from "../../provider/index.ts"
import { providerNames } from "../../providers/providerNames.ts"
import { readFlag, readOptionalOption } from "../options.ts"

export type ModelListCommandOptions = {
  database: Database
}

export function makeModelListHandler(options: ModelListCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const providerOption = readOptionalOption(context.options, "--provider")
    const all = readFlag(context.options, "--all")
    const targetProviderNames =
      providerOption === undefined ? providerNames : [providerOption]

    for (const providerName of targetProviderNames) {
      try {
        const providerConfig = await readProviderConfig(
          options.database,
          providerName,
        )
        const defaultModel = providerConfig.defaultModel

        if (!all) {
          const modelNames = await listModelConfigs(
            options.database,
            providerName,
          )

          for (const modelName of modelNames) {
            const defaultSuffix = modelName === defaultModel ? " (default)" : ""
            console.log(`${providerName} ${modelName}${defaultSuffix}`)
          }

          continue
        }

        const models = await listAvailableModels(options.database, providerName)

        for (const model of models) {
          const modelName = model.id
          const pinned = await isModelPinned(
            options.database,
            providerName,
            modelName,
          )

          const tags: Array<string> = []
          if (pinned) tags.push("pinned")
          if (modelName === defaultModel) tags.push("default")
          const suffix = tags.length === 0 ? "" : ` (${tags.join(", ")})`

          console.log(`${providerName} ${modelName}${suffix}`)
        }
      } catch (error) {
        console.error(`[${providerName}] ${errorMessage(error)}`)
      }
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
