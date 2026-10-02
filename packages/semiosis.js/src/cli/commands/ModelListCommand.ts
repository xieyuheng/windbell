import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { isModelEnabled, listAvailableModels } from "../../models/index.ts"
import { providerNames } from "../../providers/providerNames.ts"
import { readOptionalOption } from "../options.ts"

export type ModelListCommandOptions = {
  database: Database
}

export function makeModelListHandler(options: ModelListCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const providerName = readOptionalOption(context.options, "--provider")

    if (providerName !== undefined) {
      await printProviderModels(providerName, options.database)

      return
    }

    for (const providerName of providerNames) {
      console.log(providerName)

      try {
        const modelNames = await listAvailableModels(
          options.database,
          providerName,
        )

        if (modelNames.length === 0) {
          console.log("  (no models)")
          continue
        }

        for (const modelName of modelNames) {
          const enabled = await isModelEnabled(
            options.database,
            providerName,
            modelName,
          )

          console.log(`  ${formatModelName(modelName, enabled)}`)
        }
      } catch (error) {
        console.error(`  (error: ${errorMessage(error)})`)
      }
    }
  }
}

async function printProviderModels(
  providerName: string,
  database: Database,
): Promise<void> {
  try {
    const modelNames = await listAvailableModels(database, providerName)

    for (const modelName of modelNames) {
      const enabled = await isModelEnabled(database, providerName, modelName)

      console.log(formatModelName(modelName, enabled))
    }
  } catch (error) {
    console.error(`[${providerName}] ${errorMessage(error)}`)
  }
}

function formatModelName(name: string, enabled: boolean): string {
  return enabled ? `${name} (enabled)` : name
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
