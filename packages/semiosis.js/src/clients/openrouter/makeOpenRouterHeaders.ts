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

  // 向 OpenRouter 标识应用来源，不参与鉴权，也不影响模型调用。
  headers["HTTP-Referer"] = "https://windbell.xieyuheng.com"

  // OpenRouter 应用归因、排行榜和用量展示中使用的应用名称。
  headers["X-Title"] = "windbell"

  return headers
}
