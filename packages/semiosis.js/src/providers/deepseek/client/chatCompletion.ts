import type { ChatCompletionInput } from "./ChatCompletionInput.ts"
import type { ChatCompletionOutput } from "./ChatCompletionOutput.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import { makeHeaders } from "./makeHeaders.ts"
import { parseChatCompletionOutput } from "./parseChatCompletionOutput.ts"

export async function chatCompletion(
  config: ClientConfig,
  input: ChatCompletionInput,
): Promise<ChatCompletionOutput> {
  const body = makeChatCompletionBody(input)
  const response = await fetch(chatCompletionUrl(config.baseUrl), {
    method: "POST",
    headers: makeHeaders(config, { json: true }),
    body: JSON.stringify(body),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`[chatCompletion] HTTP ${response.status}: ${text}`)
  }

  return parseChatCompletionOutput(text)
}

function makeChatCompletionBody(
  input: ChatCompletionInput,
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

function chatCompletionUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`
}
