import fs from "node:fs/promises"
import Path from "node:path"
import type { Database } from "./Database.ts"
import { assertId } from "./id.ts"
import { isEnoent, readTextFile, writeTextFile } from "./jsonFile.ts"

export function apiKeyPath(database: Database, providerName: string): string {
  assertId(providerName)
  return Path.join(database.root, ".secrets", "api-keys", providerName)
}

export async function readApiKey(
  database: Database,
  providerName: string,
): Promise<string> {
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

export async function writeApiKey(
  database: Database,
  providerName: string,
  key: string,
): Promise<void> {
  const value = key.trim()
  if (value === "") {
    throw new Error(`[writeApiKey] api key is empty: ${providerName}`)
  }

  await writeTextFile(apiKeyPath(database, providerName), `${value}\n`)
}

export async function deleteApiKey(
  database: Database,
  providerName: string,
): Promise<boolean> {
  try {
    await fs.rm(apiKeyPath(database, providerName))
    return true
  } catch (error) {
    if (isEnoent(error)) return false
    throw error
  }
}
