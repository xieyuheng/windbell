import type * as S from "@xieyuheng/semiosis.js"
import { makeJsonEndpoint, withNotFoundAsUndefined } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClient.ts"
import {
  ProviderApiKeyStatusSchema,
  ProviderConfigListSchema,
  ProviderConfigSchema,
  ProviderModelEntryListSchema,
  VoidSchema,
  type ProviderApiKeyStatus,
} from "./schemas.ts"

export type ListModelsOptions = {
  providerName: string
  all?: boolean
}

export type ModelActionOptions = {
  providerName: string
  modelName: string
}

export type PutApiKeyOptions = {
  providerName: string
  key: string
}

export type ProvidersClient = {
  list(): Promise<Array<S.ProviderConfig>>
  get(providerName: string): Promise<S.ProviderConfig | undefined>
  getApiKeyStatus(providerName: string): Promise<ProviderApiKeyStatus>
  listModels(options: ListModelsOptions): Promise<Array<S.ProviderModelEntry>>
  enableModel(options: ModelActionOptions): Promise<void>
  disableModel(options: ModelActionOptions): Promise<void>
  setDefaultModel(options: ModelActionOptions): Promise<void>
  putApiKey(options: PutApiKeyOptions): Promise<void>
  deleteApiKey(providerName: string): Promise<void>
}

export function makeProvidersClient(
  config: SemiosisClientConfig,
): ProvidersClient {
  return {
    list: makeJsonEndpoint(config, {
      method: "GET",
      path: "/providers",
      output: ProviderConfigListSchema,
    }),

    get: withNotFoundAsUndefined(
      makeJsonEndpoint(config, {
        method: "GET",
        path: (providerName: string) =>
          `/providers/${encodeURIComponent(providerName)}`,
        output: ProviderConfigSchema,
      }),
    ),

    getApiKeyStatus: makeJsonEndpoint(config, {
      method: "GET",
      path: (providerName: string) =>
        `/providers/${encodeURIComponent(providerName)}/api-key`,
      output: ProviderApiKeyStatusSchema,
    }),

    listModels: makeJsonEndpoint(config, {
      method: "GET",
      path: (options: ListModelsOptions) =>
        `/providers/${encodeURIComponent(options.providerName)}/models`,
      query: (options: ListModelsOptions) => {
        const query = new URLSearchParams()
        if (options.all === true) {
          query.set("all", "true")
        }
        return query
      },
      output: ProviderModelEntryListSchema,
    }),

    enableModel: makeJsonEndpoint(config, {
      method: "POST",
      path: (options: ModelActionOptions) =>
        `/providers/${encodeURIComponent(options.providerName)}/models/enable`,
      body: (options: ModelActionOptions) => ({
        modelName: options.modelName,
      }),
      output: VoidSchema,
    }),

    disableModel: makeJsonEndpoint(config, {
      method: "POST",
      path: (options: ModelActionOptions) =>
        `/providers/${encodeURIComponent(options.providerName)}/models/disable`,
      body: (options: ModelActionOptions) => ({
        modelName: options.modelName,
      }),
      output: VoidSchema,
    }),

    setDefaultModel: makeJsonEndpoint(config, {
      method: "PUT",
      path: (options: ModelActionOptions) =>
        `/providers/${encodeURIComponent(options.providerName)}/default-model`,
      body: (options: ModelActionOptions) => ({
        modelName: options.modelName,
      }),
      output: VoidSchema,
    }),

    putApiKey: makeJsonEndpoint(config, {
      method: "PUT",
      path: (options: PutApiKeyOptions) =>
        `/providers/${encodeURIComponent(options.providerName)}/api-key`,
      body: (options: PutApiKeyOptions) => ({ key: options.key }),
      output: VoidSchema,
    }),

    deleteApiKey: makeJsonEndpoint(config, {
      method: "DELETE",
      path: (providerName: string) =>
        `/providers/${encodeURIComponent(providerName)}/api-key`,
      output: VoidSchema,
    }),
  }
}
