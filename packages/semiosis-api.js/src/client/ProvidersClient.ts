import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional } from "./http.ts"

export type ProvidersClient = {
  list(): Promise<Array<S.ProviderInfo>>
  get(providerName: string): Promise<S.ProviderInfo | undefined>
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
  }
}
