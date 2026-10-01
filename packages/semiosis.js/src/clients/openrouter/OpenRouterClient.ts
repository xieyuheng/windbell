import type { OpenRouterChatCompletionInput } from "./OpenRouterChatCompletionInput.ts"
import type { OpenRouterChatCompletionOutput } from "./OpenRouterChatCompletionOutput.ts"
import type { OpenRouterModelInfo } from "./OpenRouterModelInfo.ts"

export type OpenRouterClient = {
  chatCompletion: (
    input: OpenRouterChatCompletionInput,
  ) => Promise<OpenRouterChatCompletionOutput>
  listModels: () => Promise<Array<OpenRouterModelInfo>>
}
