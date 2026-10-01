import type { Client } from "./Client.ts"
import type { ClientConfig } from "./ClientConfig.ts"
import { chatCompletion } from "./chatCompletion.ts"
import { listModels } from "./listModels.ts"

export function makeClient(config: ClientConfig): Client {
  return {
    chatCompletion: (input) => chatCompletion(config, input),
    listModels: () => listModels(config),
  }
}
