import type { OpenRouterClientConfig } from "./OpenRouterClientConfig.ts"

export type MakeOpenRouterHeadersOptions = {
  json?: boolean
}

export function makeOpenRouterHeaders(
  config: OpenRouterClientConfig,
  options: MakeOpenRouterHeadersOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.key}`,
  }

  if (options.json === true) {
    headers["Content-Type"] = "application/json"
  }

  if (config.siteUrl !== undefined) {
    headers["HTTP-Referer"] = config.siteUrl
  }

  if (config.siteName !== undefined) {
    headers["X-Title"] = config.siteName
  }

  return headers
}
