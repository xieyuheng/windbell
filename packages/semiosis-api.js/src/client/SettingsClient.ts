import type * as S from "@xieyuheng/semiosis.js"
import { requestJson } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

export type SettingsClient = {
  get(): Promise<S.Settings>
  put(settings: S.Settings): Promise<void>
}

export function makeSettingsClient(
  config: SemiosisClientConfig,
): SettingsClient {
  return {
    get: () =>
      requestJson<S.Settings>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: "/settings",
      }),

    put: async (settings) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "PUT",
        path: "/settings",
        body: settings,
      })
    },
  }
}
