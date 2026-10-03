import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional } from "./http.ts"

export type ProvidersClient = {
  list(): Promise<Array<S.ProviderConfig>>
  get(providerName: string): Promise<S.ProviderConfig | undefined>
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
