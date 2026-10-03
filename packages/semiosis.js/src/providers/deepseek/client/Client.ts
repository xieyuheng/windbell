import { makeJsonEndpoint } from "../../../http/index.ts"
import type { ChatCompletionInput } from "./ChatCompletionInput.ts"
import {
  ChatCompletionOutputSchema,
  type ChatCompletionOutput,
} from "./ChatCompletionOutputSchema.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import {
  type ModelListOutput,
  ModelListOutputSchema,
} from "./ModelListOutputSchema.ts"

export type Client = {
  chatCompletion: (input: ChatCompletionInput) => Promise<ChatCompletionOutput>
  listModels: () => Promise<ModelListOutput>
}

export function makeClient(config: ClientConfig): Client {
  const headers = new Headers({
    Authorization: `Bearer ${config.key}`,
  })

  return {
    chatCompletion: makeJsonEndpoint(config, {
      method: "POST",
      path: "/chat/completions",
      body: makeChatCompletionBody,
      output: ChatCompletionOutputSchema,
      headers,
    }),

    listModels: makeJsonEndpoint(config, {
      method: "GET",
      path: "/models",
      output: ModelListOutputSchema,
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
    thinking: input.thinking,
    reasoning_effort: input.reasoning_effort,
  }

  if (input.tools.length !== 0) {
    body.tools = input.tools
  }

  return body
}
