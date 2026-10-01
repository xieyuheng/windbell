import type { ToolCall } from "./ToolCall.ts"

export type Message = {
  role: "system" | "user" | "assistant" | "tool"
  content?: string | null
  reasoning?: string | null
  reasoning_details?: Array<unknown> | null
  tool_calls?: Array<ToolCall> | null
  tool_call_id?: string
}
