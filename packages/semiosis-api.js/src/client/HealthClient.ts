import { requestJson } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

export type HealthClient = () => Promise<{
  ok: boolean
  service: string
}>

export function makeHealthClient(config: SemiosisClientConfig): HealthClient {
  return () =>
    requestJson<{ ok: boolean; service: string }>({
      baseUrl: config.baseUrl,
      method: "GET",
      path: "/health",
    })
}
