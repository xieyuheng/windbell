import { makeJsonEndpoint } from "../../../http/index.ts"
import type { ChatCompletionInput } from "./ChatCompletionInput.ts"
import type { ChatCompletionOutput } from "./ChatCompletionOutput.ts"
import { chatCompletionOutputSchema } from "./ChatCompletionOutputSchema.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import type { ModelListOutput } from "./ModelListOutputSchema.ts"
import { modelListOutputSchema } from "./ModelListOutputSchema.ts"

export type Client = {
  chatCompletion: (input: ChatCompletionInput) => Promise<ChatCompletionOutput>
  listModels: () => Promise<ModelListOutput>
}

export function makeClient(config: ClientConfig): Client {
  const headers = new Headers({
    Authorization: `Bearer ${config.key}`,
    "HTTP-Referer": "https://windbell.xieyuheng.com",
    "X-Title": "windbell",
  })

  return {
    chatCompletion: makeJsonEndpoint(config, {
      method: "POST",
      path: "/chat/completions",
      body: makeChatCompletionBody,
      output: chatCompletionOutputSchema,
      headers,
    }),

    listModels: makeJsonEndpoint(config, {
      method: "GET",
      path: "/models",
      output: modelListOutputSchema,
      headers,
    }),
  }
}

function makeChatCompletionBody(
  input: ChatCompletionInput,
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
