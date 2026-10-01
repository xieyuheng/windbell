import type { OpenRouterMessage } from "./OpenRouterMessage.ts"

export type OpenRouterChatCompletionOutput = {
  choices: Array<{
    message: OpenRouterMessage
  }>
}
