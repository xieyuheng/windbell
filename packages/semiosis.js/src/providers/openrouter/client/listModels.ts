import type { ClientConfig } from "./ClientConfig.ts"
import type { ModelInfo } from "./ModelInfo.ts"
import { makeHeaders } from "./makeHeaders.ts"
import { parseModelListOutput } from "./parseModelListOutput.ts"

export async function listModels(
  config: ClientConfig,
): Promise<Array<ModelInfo>> {
  const response = await fetch(modelsUrl(config.baseUrl), {
    headers: makeHeaders(config),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`[listModels] HTTP ${response.status}: ${text}`)
  }

  return parseModelListOutput(text).data
}

function modelsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/models`
}
