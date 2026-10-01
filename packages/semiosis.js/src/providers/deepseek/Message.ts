import type { ToolCall } from "./ToolCall.ts"

export type Message = {
  role: "system" | "user" | "assistant" | "tool"
  content?: string | null
  reasoning_content?: string | null
  tool_calls?: Array<ToolCall> | null
  tool_call_id?: string
}
