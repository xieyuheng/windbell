import type { OpenRouterToolCall } from "./OpenRouterToolCall.ts"

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant" | "tool"
  content?: string | null
  reasoning?: string | null
  reasoning_details?: Array<unknown> | null
  tool_calls?: Array<OpenRouterToolCall> | null
  tool_call_id?: string
}
