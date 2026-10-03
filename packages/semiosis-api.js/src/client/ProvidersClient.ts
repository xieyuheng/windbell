import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional } from "./http.ts"

export type ProviderApiKeyStatus = {
  configured: boolean
}

export type ProvidersClient = {
  list(): Promise<Array<S.ProviderConfig>>
  get(providerName: string): Promise<S.ProviderConfig | undefined>
  getApiKeyStatus(providerName: string): Promise<ProviderApiKeyStatus>
  listModels(providerName: string): Promise<Array<S.ModelSummary>>
  putApiKey(providerName: string, key: string): Promise<void>
  deleteApiKey(providerName: string): Promise<void>
}

export function makeProvidersClient(
  config: SemiosisClientConfig,
): ProvidersClient {
  return {
    list: () => call(config.baseUrl, "GET", "/providers"),

    get: (providerName) =>
      callOptional(
        config.baseUrl,
        "GET",
        `/providers/${encodeURIComponent(providerName)}`,
      ),

    getApiKeyStatus: (providerName) =>
      call(
        config.baseUrl,
        "GET",
        `/providers/${encodeURIComponent(providerName)}/api-key`,
      ),

    listModels: (providerName) =>
      call(
        config.baseUrl,
        "GET",
        `/providers/${encodeURIComponent(providerName)}/models`,
      ),

    putApiKey: async (providerName, key) => {
      await call(
        config.baseUrl,
        "PUT",
        `/providers/${encodeURIComponent(providerName)}/api-key`,
        { key },
      )
    },

    deleteApiKey: async (providerName) => {
      await call(
        config.baseUrl,
        "DELETE",
        `/providers/${encodeURIComponent(providerName)}/api-key`,
      )
    },
  }
}
