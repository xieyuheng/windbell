import fs from "node:fs/promises"
import Path from "node:path"
import { assertId, isValidId } from "./id.ts"
import { listFiles, readJsonFile, writeJsonFile } from "./jsonFile.ts"

export type ModelStoreOptions = {
  providersRoot: string
}

export type ModelStore = {
  get(providerName: string, modelName: string): Promise<unknown | undefined>

  put(providerName: string, modelName: string, value: unknown): Promise<void>

  list(providerName: string): Promise<Array<string>>

  remove(providerName: string, modelName: string): Promise<void>
}

export function makeModelStore(options: ModelStoreOptions): ModelStore {
  const providersRoot = Path.resolve(options.providersRoot)

  const modelsDir = (providerName: string): string => {
    return Path.join(providersRoot, providerName, "models")
  }

  const modelPath = (providerName: string, modelName: string): string => {
    return Path.join(modelsDir(providerName), `${modelName}.json`)
  }

  const store: ModelStore = {
    async get(providerName, modelName) {
      assertId(providerName)
      assertId(modelName)
      return await readJsonFile(modelPath(providerName, modelName))
    },

    async put(providerName, modelName, value) {
      assertId(providerName)
      assertId(modelName)
      await writeJsonFile(modelPath(providerName, modelName), value)
    },

    async list(providerName) {
      assertId(providerName)

      const fileNames = await listFiles(modelsDir(providerName))
      const modelNames: Array<string> = []

      for (const fileName of fileNames) {
        if (!fileName.endsWith(".json")) continue

        const modelName = fileName.slice(0, -".json".length)
        if (!isValidId(modelName)) continue

        modelNames.push(modelName)
      }

      modelNames.sort()
      return modelNames
    },

    async remove(providerName, modelName) {
      assertId(providerName)
      assertId(modelName)
      await fs.rm(modelPath(providerName, modelName), { force: true })
    },
  }

  return store
}
