import { makeJsonEndpoint } from "@xieyuheng/http.js"
import type { ChatCompletionInput } from "./ChatCompletionInput.ts"
import {
  ChatCompletionSchema,
  type ChatCompletion,
} from "./ChatCompletionSchema.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import { type ModelList, ModelListSchema } from "./ModelListSchema.ts"

export type Client = {
  chat: {
    completions: {
      create: (input: ChatCompletionInput) => Promise<ChatCompletion>
    }
  }
  models: {
    list: () => Promise<ModelList>
  }
}

export function makeClient(config: ClientConfig): Client {
  const headers = new Headers({
    Authorization: `Bearer ${config.key}`,
  })

  return {
    chat: {
      completions: {
        create: makeJsonEndpoint(config, {
          method: "POST",
          path: "/chat/completions",
          body: makeChatCompletionBody,
          output: ChatCompletionSchema,
          headers,
        }),
      },
    },

    models: {
      list: makeJsonEndpoint(config, {
        method: "GET",
        path: "/models",
        output: ModelListSchema,
        headers,
      }),
    },
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
