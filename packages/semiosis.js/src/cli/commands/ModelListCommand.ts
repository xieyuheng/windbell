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
    const providerName = readOptionalOption(context.options, "--provider")
    const all = readFlag(context.options, "--all")

    if (providerName !== undefined) {
      await printProviderModels({
        database: options.database,
        providerName,
        all,
        indent: false,
      })

      return
    }

    for (const providerName of providerNames) {
      console.log(providerName)

      await printProviderModels({
        database: options.database,
        providerName,
        all,
        indent: true,
      })
    }
  }
}

async function printProviderModels(options: {
  database: Database
  providerName: string
  all: boolean
  indent: boolean
}): Promise<void> {
  const indent = options.indent ? "  " : ""

  try {
    const modelNames = await listAvailableModels(
      options.database,
      options.providerName,
    )

    const lines: Array<string> = []

    for (const modelName of modelNames) {
      const enabled = await isModelEnabled(
        options.database,
        options.providerName,
        modelName,
      )

      if (!options.all && !enabled) continue

      if (options.all) {
        lines.push(`${indent}${formatModelName(modelName, enabled)}`)
      } else {
        lines.push(`${indent}${modelName}`)
      }
    }

    if (lines.length === 0) {
      console.log(`${indent}(no models)`)
      return
    }

    for (const line of lines) {
      console.log(line)
    }
  } catch (error) {
    console.error(`${indent}(error: ${errorMessage(error)})`)
  }
}

function formatModelName(name: string, enabled: boolean): string {
  return enabled ? `${name} (enabled)` : name
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
