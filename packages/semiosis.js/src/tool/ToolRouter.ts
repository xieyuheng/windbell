import { errorReport } from "@xieyuheng/std.js/error"
import { Ajv } from "ajv"
import type { Agent } from "../agent/Agent.ts"
import {
  ToolOutputSign,
  type Sign,
  type ToolCallSign,
  type ToolSign,
} from "../sign/index.ts"
import type { ToolHandler, ToolRoute } from "./Tool.ts"

export class ToolRouter {
  ajv = new Ajv({
    allErrors: true,
    strict: false,
  })

  routes: Record<string, ToolRoute> = {}

  defineTool(sign: ToolSign, handler: ToolHandler): void {
    if (this.routes[sign.name] !== undefined) {
      throw new Error(`[ToolRouter] duplicate tool: ${sign.name}`)
    }

    const validate = this.ajv.compile(sign.parameters)
    this.routes[sign.name] = { sign, handler, validate }
  }

  async run(agent: Agent, toolCall: ToolCallSign): Promise<Sign> {
    const route = this.routes[toolCall.name]
    if (route === undefined) {
      return ToolOutputSign(
        toolCall.callId,
        `[ToolRouter] unknown tool: ${toolCall.name}`,
      )
    }

    try {
      const args = toolArgumentsParse(toolCall)

      if (!route.validate(args)) {
        const errors = route.validate.errors ?? []
        const message = errors
          .map((error) => `${error.instancePath} ${error.message}`.trim())
          .join("; ")

        throw new Error(
          `[ToolRouter] invalid arguments for tool ${toolCall.name}: ${message}`,
        )
      }

      const content = await route.handler(agent, args)
      return ToolOutputSign(toolCall.callId, content)
    } catch (error) {
      return ToolOutputSign(toolCall.callId, errorReport(error))
    }
  }

  get toolSigns(): Array<ToolSign> {
    return Object.values(this.routes).map((route) => route.sign)
  }
}

export function makeToolRouter(): ToolRouter {
  return new ToolRouter()
}

function toolArgumentsParse(toolCall: ToolCallSign): Record<string, unknown> {
  const value = toolArgumentsJsonParse(toolCall)

  if (typeof value !== "object" || value === null || value instanceof Array) {
    throw new Error(
      `[ToolRouter] arguments for tool ${toolCall.name} must be a JSON object`,
    )
  }

  return value as Record<string, unknown>
}

function toolArgumentsJsonParse(toolCall: ToolCallSign): unknown {
  try {
    return JSON.parse(toolCall.arguments)
  } catch (error) {
    throw new Error(
      `[ToolRouter] invalid arguments for tool ${toolCall.name}: ${errorReport(error)}`,
    )
  }
}
