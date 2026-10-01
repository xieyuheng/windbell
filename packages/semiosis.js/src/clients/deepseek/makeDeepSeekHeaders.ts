import type { DeepSeekClientConfig } from "./DeepSeekClientConfig.ts"

export type MakeDeepSeekHeadersOptions = {
  json?: boolean
}

export function makeDeepSeekHeaders(
  config: DeepSeekClientConfig,
  options: MakeDeepSeekHeadersOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.key}`,
  }

  if (options.json === true) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}
