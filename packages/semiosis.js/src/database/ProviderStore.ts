import fs from "node:fs/promises"
import Path from "node:path"
import type { ProviderConfig } from "../provider/index.ts"
import { parseProviderConfig } from "../provider/index.ts"
import { assertId, isValidId } from "./id.ts"
import {
  isEnoent,
  listDirectories,
  readJsonFile,
  writeJsonFile,
} from "./jsonFile.ts"

export type ProviderStoreOptions = {
  root: string
}

export type ProviderStore = {
  get(providerName: string): Promise<ProviderConfig | undefined>
  put(providerName: string, value: ProviderConfig): Promise<void>
  list(): Promise<Array<string>>
  remove(providerName: string): Promise<void>
}

export function makeProviderStore(
  options: ProviderStoreOptions,
): ProviderStore {
  const root = Path.resolve(options.root)

  const providerDir = (providerName: string): string => {
    return Path.join(root, providerName)
  }

  const providerPath = (providerName: string): string => {
    return Path.join(providerDir(providerName), "index.json")
  }

  const store: ProviderStore = {
    async get(providerName) {
      assertId(providerName)

      const value = await readJsonFile(providerPath(providerName))
      if (value === undefined) return undefined

      return parseProviderConfig(value)
    },

    async put(providerName, value) {
      assertId(providerName)

      if (value.name !== providerName) {
        throw new Error(
          `[ProviderStore] provider name mismatch: expected ${providerName}, got ${value.name}`,
        )
      }

      await writeJsonFile(providerPath(providerName), value)
    },

    async list() {
      const directoryNames = await listDirectories(root)
      const providerNames: Array<string> = []

      for (const providerName of directoryNames) {
        if (!isValidId(providerName)) continue
        if (!(await pathExists(providerPath(providerName)))) continue

        providerNames.push(providerName)
      }

      providerNames.sort()
      return providerNames
    },

    async remove(providerName) {
      assertId(providerName)
      await fs.rm(providerDir(providerName), { recursive: true, force: true })
    },
  }

  return store
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch (error) {
    if (isEnoent(error)) return false
    throw error
  }
}
