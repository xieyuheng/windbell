import type { WindbellHealth } from "../service/health.ts"

export type WindbellClientConfig = {
  baseUrl: string
}

export type WindbellClient = {
  health(): Promise<WindbellHealth>
}

export function makeWindbellClient(
  config: WindbellClientConfig,
): WindbellClient {
  return {
    async health() {
      const response = await fetch(joinUrl(config.baseUrl, "/api/health"))
      const text = await response.text()

      if (!response.ok) {
        throw new Error(
          `[WindbellClient] health failed with HTTP ${response.status}: ${text}`,
        )
      }

      return JSON.parse(text) as WindbellHealth
    },
  }
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`
}
