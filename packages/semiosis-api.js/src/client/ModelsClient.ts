import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call } from "./http.ts"

export type ModelsClient = {
  list(): Promise<Array<{ qualifiedName: string }>>
}

export function makeModelsClient(config: SemiosisClientConfig): ModelsClient {
  return {
    list: () => call(config.baseUrl, "GET", "/models"),
  }
}
