import Path from "node:path"
import type { Database } from "./Database.ts"
import { assertId } from "./id.ts"
import { readTextFile } from "./jsonFile.ts"

export async function readApiKey(
  database: Database,
  providerName: string,
): Promise<string> {
  assertId(providerName)

  const value = await readTextFile(apiKeyPath(database, providerName))
  if (value === undefined) {
    throw new Error(`[readApiKey] api key not found: ${providerName}`)
  }

  const key = value.trim()
  if (key === "") {
    throw new Error(`[readApiKey] api key is empty: ${providerName}`)
  }

  return key
}

function apiKeyPath(database: Database, providerName: string): string {
  return Path.join(database.root, ".secrets", "api-keys", providerName)
}
