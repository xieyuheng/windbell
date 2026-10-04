import Path from "node:path"
import type { Settings } from "../settings/Settings.ts"
import { readJsonFile, writeJsonFile } from "./jsonFile.ts"

export type SettingsStoreOptions = {
  root: string
}

export type SettingsStore = {
  get(): Promise<Settings | undefined>
  put(settings: Settings): Promise<void>
}

export function makeSettingsStore(
  options: SettingsStoreOptions,
): SettingsStore {
  const root = Path.resolve(options.root)
  const path = Path.join(root, "settings.json")

  return {
    async get() {
      const value = await readJsonFile(path)
      if (value === undefined) return undefined
      if (
        value === null ||
        typeof value !== "object" ||
        value instanceof Array
      ) {
        return undefined
      }

      const record = value as Record<string, unknown>
      return {
        defaultProvider:
          typeof record.defaultProvider === "string"
            ? record.defaultProvider
            : null,
        themeId: typeof record.themeId === "string" ? record.themeId : null,
      }
    },

    async put(settings) {
      await writeJsonFile(path, settings)
    },
  }
}
