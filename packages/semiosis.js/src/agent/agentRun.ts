import {
  ErrorSign,
  isAssistantSign,
  isErrorSign,
  type Sign,
} from "../sign/index.ts"
import type { Agent } from "./Agent.ts"

export async function* agentRun(
  agent: Agent,
  input: Sign,
): AsyncGenerator<Sign> {
  agent.context.signs.push(input)

  let step = 0
  while (true) {
    if (step >= agent.config.maxSteps) {
      yield ErrorSign(`[agentRun] max steps reached: ${agent.config.maxSteps}`)
      return
    }

    step += 1

    const output = await agent.model.interpret({
      context: agent.context,
    })

    const sign = output.sign

    if (isErrorSign(sign)) {
      yield sign
      return
    }

    if (!isAssistantSign(sign)) {
      yield ErrorSign(`[agentRun] unexpected model output sign: ${sign.kind}`)
      return
    }

    agent.context.signs.push(sign)
    yield sign

    if (sign.toolCalls.length === 0) {
      return
    }

    for (const toolCall of sign.toolCalls) {
      const sign = await agent.config.toolRouter.run(agent, toolCall)

      if (isErrorSign(sign)) {
        yield sign
        return
      }

      agent.context.signs.push(sign)
      yield sign
    }
  }
}
