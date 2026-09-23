import type { Model } from "../model/Model.ts"
import type { Sign } from "../sign/index.ts"
import type { ToolRouter } from "../tool/index.ts"

export type Agent = {
  model: Model
  config: AgentConfig
  context: Array<Sign>
}

export type AgentConfig = {
  cwd: string
  toolRouter: ToolRouter
}

export function makeAgent(
  model: Model,
  config: AgentConfig,
  context: Array<Sign>,
): Agent {
  return {
    model,
    config,
    context,
  }
}
