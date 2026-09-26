import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call } from "./http.ts"

export type SettingsClient = {
  get(): Promise<S.Settings>
  put(settings: S.Settings): Promise<void>
}

export function makeSettingsClient(
  config: SemiosisClientConfig,
): SettingsClient {
  return {
    get: () => call(config.baseUrl, "GET", "/settings"),

    put: async (settings) => {
      await call(config.baseUrl, "PUT", "/settings", settings)
    },
  }
}
