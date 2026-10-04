import { makeJsonEndpoint } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClient.ts"
import { HealthSchema, type Health } from "./schemas.ts"

export type HealthClient = () => Promise<Health>

export function makeHealthClient(config: SemiosisClientConfig): HealthClient {
  return makeJsonEndpoint(config, {
    method: "GET",
    path: "/health",
    output: HealthSchema,
  })
}
