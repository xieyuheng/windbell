import type { OpenRouterChatCompletionInput } from "./OpenRouterChatCompletionInput.ts"
import type { OpenRouterChatCompletionOutput } from "./OpenRouterChatCompletionOutput.ts"
import type { OpenRouterClientConfig } from "./OpenRouterClientConfig.ts"
import { makeOpenRouterHeaders } from "./makeOpenRouterHeaders.ts"
import { parseOpenRouterChatCompletionOutput } from "./parseOpenRouterChatCompletionOutput.ts"

export async function openRouterChatCompletion(
  config: OpenRouterClientConfig,
  input: OpenRouterChatCompletionInput,
): Promise<OpenRouterChatCompletionOutput> {
  const body = makeOpenRouterChatCompletionBody(input)
  const response = await fetch(openRouterChatCompletionUrl(config.baseUrl), {
    method: "POST",
    headers: makeOpenRouterHeaders(config, { json: true }),
    body: JSON.stringify(body),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(
      `[openRouterChatCompletion] HTTP ${response.status}: ${text}`,
    )
  }

  return parseOpenRouterChatCompletionOutput(text)
}

function makeOpenRouterChatCompletionBody(
  input: OpenRouterChatCompletionInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: input.model,
    messages: input.messages,
  }

  if (input.tools.length !== 0) {
    body.tools = input.tools
  }

  if (input.reasoning !== undefined) {
    body.reasoning = input.reasoning
  }

  if (input.provider !== undefined) {
    body.provider = input.provider
  }

  if (input.extraBody !== undefined) {
    Object.assign(body, input.extraBody)
  }

  return body
}

function openRouterChatCompletionUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`
}
