import type { OpenRouterClientConfig } from "./OpenRouterClientConfig.ts"
import type { OpenRouterModelInfo } from "./OpenRouterModelInfo.ts"
import { makeOpenRouterHeaders } from "./makeOpenRouterHeaders.ts"
import { parseOpenRouterModelListOutput } from "./parseOpenRouterModelListOutput.ts"

export async function openRouterListModels(
  config: OpenRouterClientConfig,
): Promise<Array<OpenRouterModelInfo>> {
  const response = await fetch(openRouterModelsUrl(config.baseUrl), {
    headers: makeOpenRouterHeaders(config),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`[openRouterListModels] HTTP ${response.status}: ${text}`)
  }

  return parseOpenRouterModelListOutput(text).data
}

function openRouterModelsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/models`
}
