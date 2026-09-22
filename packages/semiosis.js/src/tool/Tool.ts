import type { Agent } from "../agent/Agent.ts"
import type { ToolSign } from "../sign/index.ts"

export type ToolCall = {
  id: string
  name: string
  arguments: string
}

export type ToolHandler = (
  agent: Agent,
  args: Record<string, unknown>,
) => string | Promise<string>

export type ToolRoute = {
  sign: ToolSign
  handler: ToolHandler
}
