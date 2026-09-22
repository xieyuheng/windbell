import { errorReport } from "@xieyuheng/std.js/error"
import { Ajv } from "ajv"
import type { Agent } from "../agent/Agent.ts"
import { ToolOutputSign, type Sign, type ToolSign } from "../sign/index.ts"
import type { ToolCall, ToolHandler, ToolRoute } from "./Tool.ts"

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

  findTool(name: string): ToolRoute | undefined {
    return this.routes[name]
  }

  async run(agent: Agent, toolCall: ToolCall): Promise<Sign> {
    const route = this.findTool(toolCall.name)
    if (route === undefined) {
      return ToolOutputSign(
        toolCall.id,
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
      return ToolOutputSign(toolCall.id, content)
    } catch (error) {
      return ToolOutputSign(toolCall.id, errorReport(error))
    }
  }

  get toolSigns(): Array<ToolSign> {
    return Object.values(this.routes).map((route) => route.sign)
  }
}

export function makeToolRouter(): ToolRouter {
  return new ToolRouter()
}

function toolArgumentsParse(toolCall: ToolCall): Record<string, unknown> {
  const value = toolArgumentsJsonParse(toolCall)

  if (typeof value !== "object" || value === null || value instanceof Array) {
    throw new Error(
      `[ToolRouter] arguments for tool ${toolCall.name} must be a JSON object`,
    )
  }

  return value as Record<string, unknown>
}

function toolArgumentsJsonParse(toolCall: ToolCall): unknown {
  try {
    return JSON.parse(toolCall.arguments)
  } catch (error) {
    throw new Error(
      `[ToolRouter] invalid arguments for tool ${toolCall.name}: ${errorReport(error)}`,
    )
  }
}
