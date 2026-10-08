import {
  ErrorSign,
  isAssistantSign,
  isErrorSign,
  isProviderDataSign,
  isReasoningSign,
  isToolCallSign,
  type Sign,
  type ToolCallSign,
} from "../sign/index.ts"
import type { Agent } from "./Agent.ts"
import { repairOrphanToolCalls } from "./repairOrphanToolCalls.ts"

export async function* agentInterpret(
  agent: Agent,
  input: Array<Sign>,
): AsyncGenerator<Sign> {
  const repairs = await repairOrphanToolCalls(agent)
  yield* repairs

  await agent.appendContext(input)
  yield* input

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
        !isProviderDataSign(sign) &&
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

      await agent.appendContext([sign])
      yield sign
    }
  }
}
