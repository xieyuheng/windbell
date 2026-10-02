import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { listModelConfigs } from "../../models/index.ts"
import { providerNames } from "../../providers/providerNames.ts"
import { readOptionalOption } from "../options.ts"

export type ModelListCommandOptions = {
  database: Database
}

export function makeModelListHandler(options: ModelListCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const providerName = readOptionalOption(context.options, "--provider")

    if (providerName !== undefined) {
      const modelNames = await listModelConfigs(options.database, providerName)

      for (const modelName of modelNames) {
        console.log(modelName)
      }

      return
    }

    for (const providerName of providerNames) {
      const modelNames = await listModelConfigs(options.database, providerName)

      console.log(providerName)

      if (modelNames.length === 0) {
        console.log("  (no models)")
        continue
      }

      for (const modelName of modelNames) {
        console.log(`  ${modelName}`)
      }
    }
  }
}
