import type * as S from "@xieyuheng/semiosis.js"
import { requestJson, requestJsonOptional } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

export type ProviderApiKeyStatus = {
  configured: boolean
}

export type ListModelsOptions = {
  all?: boolean
}

export type ProvidersClient = {
  list(): Promise<Array<S.ProviderConfig>>
  get(providerName: string): Promise<S.ProviderConfig | undefined>
  getApiKeyStatus(providerName: string): Promise<ProviderApiKeyStatus>
  listModels(
    providerName: string,
    options?: ListModelsOptions,
  ): Promise<Array<S.ProviderModelEntry>>
  enableModel(providerName: string, modelName: string): Promise<void>
  disableModel(providerName: string, modelName: string): Promise<void>
  setDefaultModel(providerName: string, modelName: string): Promise<void>
  putApiKey(providerName: string, key: string): Promise<void>
  deleteApiKey(providerName: string): Promise<void>
}

export function makeProvidersClient(
  config: SemiosisClientConfig,
): ProvidersClient {
  return {
    list: () =>
      requestJson<Array<S.ProviderConfig>>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: "/providers",
      }),

    get: (providerName) =>
      requestJsonOptional<S.ProviderConfig>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/providers/${encodeURIComponent(providerName)}`,
      }),

    getApiKeyStatus: (providerName) =>
      requestJson<ProviderApiKeyStatus>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/providers/${encodeURIComponent(providerName)}/api-key`,
      }),

    listModels: (providerName, options) => {
      const query = new URLSearchParams()
      if (options?.all === true) {
        query.set("all", "true")
      }

      return requestJson<Array<S.ProviderModelEntry>>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/providers/${encodeURIComponent(providerName)}/models`,
        query,
      })
    },

    enableModel: async (providerName, modelName) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "POST",
        path: `/providers/${encodeURIComponent(providerName)}/models/enable`,
        body: { modelName },
      })
    },

    disableModel: async (providerName, modelName) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "POST",
        path: `/providers/${encodeURIComponent(providerName)}/models/disable`,
        body: { modelName },
      })
    },

    setDefaultModel: async (providerName, modelName) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "PUT",
        path: `/providers/${encodeURIComponent(providerName)}/default-model`,
        body: { modelName },
      })
    },

    putApiKey: async (providerName, key) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "PUT",
        path: `/providers/${encodeURIComponent(providerName)}/api-key`,
        body: { key },
      })
    },

    deleteApiKey: async (providerName) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "DELETE",
        path: `/providers/${encodeURIComponent(providerName)}/api-key`,
      })
    },
  }
}
