import type { DeepSeekChatCompletionInput } from "./DeepSeekChatCompletionInput.ts"
import type { DeepSeekChatCompletionOutput } from "./DeepSeekChatCompletionOutput.ts"
import type { DeepSeekModelInfo } from "./DeepSeekModelInfo.ts"

export type DeepSeekClient = {
  chatCompletion: (
    input: DeepSeekChatCompletionInput,
  ) => Promise<DeepSeekChatCompletionOutput>
  listModels: () => Promise<Array<DeepSeekModelInfo>>
}
