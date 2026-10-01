import type { ClientConfig } from "./ClientConfig.ts"

export type MakeHeadersOptions = {
  json?: boolean
}

export function makeHeaders(
  config: ClientConfig,
  options: MakeHeadersOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.key}`,
  }

  if (options.json === true) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}
