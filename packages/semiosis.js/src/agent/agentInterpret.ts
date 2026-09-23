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

export async function* agentInterpret(
  agent: Agent,
  input: Array<Sign>,
): AsyncGenerator<Sign> {
  await agent.appendContext(input)

  while (true) {
    const context = await agent.getContext()
    const output = await agent.model.interpret(context)

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
        yield ErrorSign(
          `[agentInterpret] unexpected model output sign: ${sign.kind}`,
        )
        return
      }

      await agent.appendContext([sign])
      yield sign

      if (isToolCallSign(sign)) {
        toolCallSigns.push(sign)
      }
    }

    if (toolCallSigns.length === 0) {
      return
    }

    for (const toolCallSign of toolCallSigns) {
      const sign = await agent.toolRouter.run(toolCallSign)

      if (isErrorSign(sign)) {
        yield sign
        return
      }

      await agent.appendContext([sign])
      yield sign
    }
  }
}
