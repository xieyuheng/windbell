import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call } from "./http.ts"

export type HealthClient = () => Promise<{
  ok: boolean
  service: string
}>

export function makeHealthClient(config: SemiosisClientConfig): HealthClient {
  return () => call(config.baseUrl, "GET", "/health")
}
