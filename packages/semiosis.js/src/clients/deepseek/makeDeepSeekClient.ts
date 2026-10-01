import type { DeepSeekClient } from "./DeepSeekClient.ts"
import type { DeepSeekClientConfig } from "./DeepSeekClientConfig.ts"
import { deepSeekChatCompletion } from "./deepSeekChatCompletion.ts"
import { deepSeekListModels } from "./listDeepSeekModels.ts"

export function makeDeepSeekClient(
  config: DeepSeekClientConfig,
): DeepSeekClient {
  return {
    chatCompletion: (input) => deepSeekChatCompletion(config, input),
    listModels: () => deepSeekListModels(config),
  }
}
