import {
  isAssistantSign,
  isProviderDataSign,
  isReasoningSign,
  isToolCallSign,
  type Sign,
  type ToolCallSign,
} from "../sign/index.ts"
import type { Agent } from "./Agent.ts"
import { repairOrphanToolCalls } from "./repairOrphanToolCalls.ts"

export type AgentInterpretOptions = {
  signal?: AbortSignal
}

export type AgentInterpretEvent =
  { type: "sign"; sign: Sign } | { type: "error"; error: unknown }

export async function* agentInterpret(
  agent: Agent,
  input: Array<Sign>,
  options: AgentInterpretOptions = {},
): AsyncGenerator<AgentInterpretEvent> {
  try {
    const repairs = await repairOrphanToolCalls(agent)

    for (const sign of repairs) {
      yield { type: "sign", sign }
    }

    await agent.appendContext(input)

    for (const sign of input) {
      yield { type: "sign", sign }
    }

    while (true) {
      if (options.signal?.aborted) return

      const context = await agent.getContext()
      const output = await agent.model.interpret(context)

      const toolCallSigns: Array<ToolCallSign> = []

      for (const sign of output) {
        if (
          !isReasoningSign(sign) &&
          !isAssistantSign(sign) &&
          !isProviderDataSign(sign) &&
          !isToolCallSign(sign)
        ) {
          throw new Error(
            `[agentInterpret] unexpected model output sign: ${sign.kind}`,
          )
        }

        await agent.appendContext([sign])
        yield { type: "sign", sign }

        if (isToolCallSign(sign)) {
          toolCallSigns.push(sign)
        }
      }

      if (toolCallSigns.length === 0) {
        return
      }

      for (const toolCallSign of toolCallSigns) {
        const sign = await agent.toolRouter.run(toolCallSign, {
          signal: options.signal,
        })

        await agent.appendContext([sign])
        yield { type: "sign", sign }
      }
    }
  } catch (error) {
    yield { type: "error", error }
  }
}
