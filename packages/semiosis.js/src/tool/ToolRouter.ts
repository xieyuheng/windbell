import type { ToolSign } from "../sign/index.ts"
import type { ToolHandler, ToolRoute } from "./Tool.ts"

export class ToolRouter {
  routes: Record<string, ToolRoute> = {}

  defineTool(sign: ToolSign, handler: ToolHandler): void {
    if (this.routes[sign.name] !== undefined) {
      throw new Error(`[ToolRouter] duplicate tool: ${sign.name}`)
    }

    this.routes[sign.name] = { sign, handler }
  }

  findTool(name: string): ToolRoute | undefined {
    return this.routes[name]
  }

  get toolSigns(): Array<ToolSign> {
    return Object.values(this.routes).map((route) => route.sign)
  }
}

export function makeToolRouter(): ToolRouter {
  return new ToolRouter()
}
