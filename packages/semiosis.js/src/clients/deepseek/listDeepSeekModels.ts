import type { DeepSeekClientConfig } from "./DeepSeekClientConfig.ts"
import type { DeepSeekModelInfo } from "./DeepSeekModelInfo.ts"
import { makeDeepSeekHeaders } from "./makeDeepSeekHeaders.ts"
import { parseDeepSeekModelListOutput } from "./parseDeepSeekModelListOutput.ts"

export async function deepSeekListModels(
  config: DeepSeekClientConfig,
): Promise<Array<DeepSeekModelInfo>> {
  const response = await fetch(deepSeekModelsUrl(config.baseUrl), {
    headers: makeDeepSeekHeaders(config),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`[deepSeekListModels] HTTP ${response.status}: ${text}`)
  }

  return parseDeepSeekModelListOutput(text).data
}

function deepSeekModelsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/models`
}
