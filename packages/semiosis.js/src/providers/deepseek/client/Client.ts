import { makeJsonEndpoint } from "../../../http/index.ts"
import type { ChatCompletionInput } from "./ChatCompletionInput.ts"
import type { ChatCompletionOutput } from "./ChatCompletionOutput.ts"
import { chatCompletionOutputSchema } from "./ChatCompletionOutputSchema.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import type { ModelListOutput } from "./ModelListOutputSchema.ts"
import { modelListOutputSchema } from "./ModelListOutputSchema.ts"
import { deepseekHeaders } from "./makeHeaders.ts"

export type Client = {
  chatCompletion: (input: ChatCompletionInput) => Promise<ChatCompletionOutput>
  listModels: () => Promise<ModelListOutput>
}

export function makeClient(config: ClientConfig): Client {
  return {
    chatCompletion: makeJsonEndpoint(config, {
      method: "POST",
      path: "/chat/completions",
      body: makeChatCompletionBody,
      output: chatCompletionOutputSchema,
      headers: [deepseekHeaders],
    }),

    listModels: makeJsonEndpoint(config, {
      method: "GET",
      path: "/models",
      output: modelListOutputSchema,
      headers: [deepseekHeaders],
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
