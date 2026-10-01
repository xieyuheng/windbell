import type { ChatCompletionInput } from "./ChatCompletionInput.ts"
import type { ChatCompletionOutput } from "./ChatCompletionOutput.ts"
import type { ModelInfo } from "./ModelInfo.ts"

export type Client = {
  chatCompletion: (input: ChatCompletionInput) => Promise<ChatCompletionOutput>
  listModels: () => Promise<Array<ModelInfo>>
}
