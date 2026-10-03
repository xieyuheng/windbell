import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { hasApiKey } from "../../database/index.ts"
import { providerNames } from "../../providers/providerNames.ts"

export type ProviderListCommandOptions = {
  database: Database
}

export function makeProviderListHandler(options: ProviderListCommandOptions) {
  return async (_context: Cli.HandlerContext) => {
    for (const providerName of providerNames) {
      const providerInfo = await options.database.providers.get(providerName)
      const apiKeyConfigured = await hasApiKey(options.database, providerName)

      console.log(providerName)

      if (providerInfo === undefined) {
        console.log("  (not configured)")
      } else {
        console.log(`  baseUrl: ${providerInfo.baseUrl}`)
        console.log(`  defaultModel: ${providerInfo.defaultModel ?? "(none)"}`)
      }

      console.log(
        `  apiKey: ${apiKeyConfigured ? "(configured)" : "(not configured)"}`,
      )
    }
  }
}
