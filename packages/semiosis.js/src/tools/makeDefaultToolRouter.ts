import { makeToolRouter, type ToolRouter } from "../tool/index.ts"
import {
  defaultBashToolDescription,
  defaultBashToolMaxOutputChars,
  defaultBashToolTimeoutMs,
  makeBashToolHandler,
  makeBashToolSign,
} from "./makeBashTool.ts"

export function makeDefaultToolRouter(): ToolRouter {
  const toolRouter = makeToolRouter()

  toolRouter.defineTool(
    makeBashToolSign({
      description: defaultBashToolDescription,
    }),
    makeBashToolHandler({
      timeoutMs: defaultBashToolTimeoutMs,
      maxOutputChars: defaultBashToolMaxOutputChars,
    }),
  )

  return toolRouter
}
