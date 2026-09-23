import type { ValidateFunction } from "ajv"
import type { ToolSign } from "../sign/index.ts"

export type ToolHandler = (
  args: Record<string, unknown>,
) => string | Promise<string>

export type ToolRoute = {
  sign: ToolSign
  handler: ToolHandler
  validate: ValidateFunction
}
