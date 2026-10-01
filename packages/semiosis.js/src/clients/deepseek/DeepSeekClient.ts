import type { DeepSeekChatCompletionInput } from "./DeepSeekChatCompletionInput.ts"
import type { DeepSeekChatCompletionOutput } from "./DeepSeekChatCompletionOutput.ts"

export type DeepSeekClient = {
  chatCompletion: (
    input: DeepSeekChatCompletionInput,
  ) => Promise<DeepSeekChatCompletionOutput>
}
