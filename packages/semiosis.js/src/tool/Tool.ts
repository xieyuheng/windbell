import type { ValidateFunction } from "ajv"
import type { Agent } from "../agent/Agent.ts"
import type { ToolSign } from "../sign/index.ts"

export type ToolHandler = (
  agent: Agent,
  args: Record<string, unknown>,
) => string | Promise<string>

export type ToolRoute = {
  sign: ToolSign
  handler: ToolHandler
  validate: ValidateFunction
}
