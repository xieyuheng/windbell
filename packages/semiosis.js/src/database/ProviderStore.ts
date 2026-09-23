import fs from "node:fs/promises"
import Path from "node:path"
import { assertId, isValidId } from "./id.ts"
import { listFiles, readJsonFile, writeJsonFile } from "./jsonFile.ts"

export type ProviderStoreOptions = {
  root: string
}

export type ProviderStore = {
  get(providerName: string): Promise<unknown | undefined>
  put(providerName: string, value: unknown): Promise<void>
  list(): Promise<Array<string>>
  remove(providerName: string): Promise<void>
}

export function makeProviderStore(
  options: ProviderStoreOptions,
): ProviderStore {
  const root = Path.resolve(options.root)

  const providerPath = (providerName: string): string => {
    return Path.join(root, `${providerName}.json`)
  }

  const store: ProviderStore = {
    async get(providerName) {
      assertId(providerName)
      return await readJsonFile(providerPath(providerName))
    },

    async put(providerName, value) {
      assertId(providerName)
      await writeJsonFile(providerPath(providerName), value)
    },

    async list() {
      const fileNames = await listFiles(root)
      const providerNames: Array<string> = []

      for (const fileName of fileNames) {
        if (!fileName.endsWith(".json")) continue

        const providerName = fileName.slice(0, -".json".length)
        if (!isValidId(providerName)) continue

        providerNames.push(providerName)
      }

      providerNames.sort()
      return providerNames
    },

    async remove(providerName) {
      assertId(providerName)
      await fs.rm(providerPath(providerName), { force: true })
    },
  }

  return store
}
