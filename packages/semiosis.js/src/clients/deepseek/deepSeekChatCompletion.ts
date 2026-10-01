import type { DeepSeekChatCompletionInput } from "./DeepSeekChatCompletionInput.ts"
import type { DeepSeekChatCompletionOutput } from "./DeepSeekChatCompletionOutput.ts"
import type { DeepSeekClientConfig } from "./DeepSeekClientConfig.ts"
import { makeDeepSeekHeaders } from "./makeDeepSeekHeaders.ts"
import { parseDeepSeekChatCompletionOutput } from "./parseDeepSeekChatCompletionOutput.ts"

export async function deepSeekChatCompletion(
  config: DeepSeekClientConfig,
  input: DeepSeekChatCompletionInput,
): Promise<DeepSeekChatCompletionOutput> {
  const body = makeDeepSeekChatCompletionBody(input)
  const response = await fetch(deepSeekChatCompletionUrl(config.baseUrl), {
    method: "POST",
    headers: makeDeepSeekHeaders(config, { json: true }),
    body: JSON.stringify(body),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`[deepSeekChatCompletion] HTTP ${response.status}: ${text}`)
  }

  return parseDeepSeekChatCompletionOutput(text)
}

function makeDeepSeekChatCompletionBody(
  input: DeepSeekChatCompletionInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: input.model,
    messages: input.messages,
    thinking: input.thinking,
    reasoning_effort: input.reasoning_effort,
  }

  if (input.tools.length !== 0) {
    body.tools = input.tools
  }

  return body
}

function deepSeekChatCompletionUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`
}
