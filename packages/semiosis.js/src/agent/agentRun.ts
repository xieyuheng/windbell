import {
  ErrorSign,
  isAssistantSign,
  isErrorSign,
  isReasoningSign,
  isToolCallSign,
  type Sign,
  type ToolCallSign,
} from "../sign/index.ts"
import type { Agent } from "./Agent.ts"

export async function* agentRun(
  agent: Agent,
  input: Sign,
): AsyncGenerator<Sign> {
  agent.context.push(input)

  let step = 0
  while (true) {
    if (step >= agent.config.maxSteps) {
      yield ErrorSign(`[agentRun] max steps reached: ${agent.config.maxSteps}`)
      return
    }

    step += 1

    const output = await agent.model.interpret(agent.context)

    const toolCallSigns: Array<ToolCallSign> = []

    for (const sign of output) {
      if (isErrorSign(sign)) {
        yield sign
        return
      }

      if (
        !isReasoningSign(sign) &&
        !isAssistantSign(sign) &&
        !isToolCallSign(sign)
      ) {
        yield ErrorSign(`[agentRun] unexpected model output sign: ${sign.kind}`)
        return
      }

      agent.context.push(sign)
      yield sign

      if (isToolCallSign(sign)) {
        toolCallSigns.push(sign)
      }
    }

    if (toolCallSigns.length === 0) {
      return
    }

    for (const toolCallSign of toolCallSigns) {
      const sign = await agent.config.toolRouter.run(agent, toolCallSign)

      if (isErrorSign(sign)) {
        yield sign
        return
      }

      agent.context.push(sign)
      yield sign
    }
  }
}
