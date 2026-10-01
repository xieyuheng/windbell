import type { OpenRouterClient } from "./OpenRouterClient.ts"
import type { OpenRouterClientConfig } from "./OpenRouterClientConfig.ts"
import { openRouterChatCompletion } from "./openRouterChatCompletion.ts"
import { openRouterListModels } from "./openRouterListModels.ts"

export function makeOpenRouterClient(
  config: OpenRouterClientConfig,
): OpenRouterClient {
  return {
    chatCompletion: (input) => openRouterChatCompletion(config, input),
    listModels: () => openRouterListModels(config),
  }
}
