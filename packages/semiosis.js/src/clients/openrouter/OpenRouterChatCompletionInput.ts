import type { OpenRouterMessage } from "./OpenRouterMessage.ts"
import type { OpenRouterTool } from "./OpenRouterTool.ts"

export type OpenRouterReasoning = {
  effort?: string
  max_tokens?: number
  exclude?: boolean
  enabled?: boolean
}

export type OpenRouterChatCompletionInput = {
  model: string
  messages: Array<OpenRouterMessage>
  tools: Array<OpenRouterTool>
  reasoning?: OpenRouterReasoning | null
  provider?: Record<string, unknown> | null
  extraBody?: Record<string, unknown>
}
