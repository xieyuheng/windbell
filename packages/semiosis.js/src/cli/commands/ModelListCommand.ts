import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { isModelEnabled, listAvailableModels } from "../../models/index.ts"
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
        const modelNames = await listAvailableModels(
          options.database,
          providerName,
        )

        for (const modelName of modelNames) {
          const enabled = await isModelEnabled(
            options.database,
            providerName,
            modelName,
          )

          if (!all && !enabled) continue

          const suffix = all && enabled ? " (enabled)" : ""
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
