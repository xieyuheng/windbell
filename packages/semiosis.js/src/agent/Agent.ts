import type { Context } from "../model/Context.ts"
import type { Model } from "../model/Model.ts"
import type { ToolRouter } from "../tool/index.ts"

export type Agent = {
  model: Model
  config: AgentConfig
  context: Context
}

export type AgentConfig = {
  cwd: string
  maxSteps: number
  toolRouter: ToolRouter
}

export function makeAgent(
  model: Model,
  config: AgentConfig,
  context: Context,
): Agent {
  return {
    model,
    config,
    context,
  }
}
