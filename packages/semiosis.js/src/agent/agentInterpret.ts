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
  { type: "sign"; sign: Sign } | { type: "input-persisted" }


export async function* agentInterpret(
  agent: Agent,
  input: Array<Sign>,
  options: AgentInterpretOptions = {},
): AsyncGenerator<AgentInterpretEvent> {
  yield* repairAgent(agent)

  const context = [...(await agent.getContext()), ...input]
  const output = await agent.model.interpret(context)

  await agent.appendContext(input)
  yield { type: "input-persisted" }

  for (const sign of input) {
    yield { type: "sign", sign }
  }

  yield* runAgentOutput(agent, output, options)
}

export async function* agentContinue(
  agent: Agent,
  options: AgentInterpretOptions = {},
): AsyncGenerator<AgentInterpretEvent> {
  yield* repairAgent(agent)

  const output = await agent.model.interpret(await agent.getContext())

  yield* runAgentOutput(agent, output, options)
}

async function* repairAgent(agent: Agent): AsyncGenerator<AgentInterpretEvent> {
  const repairs = await repairOrphanToolCalls(agent)

  for (const sign of repairs) {
    yield { type: "sign", sign }
  }
}

function assertModelOutputSign(sign: Sign): void {
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
}

async function* runAgentOutput(
  agent: Agent,
  initialOutput: Array<Sign>,
  options: AgentInterpretOptions,
): AsyncGenerator<AgentInterpretEvent> {
  let output = initialOutput

  while (true) {
    if (options.signal?.aborted) return

    output.forEach(assertModelOutputSign)
    await agent.appendContext(output)
    yield* output.map((sign): AgentInterpretEvent => ({ type: "sign", sign }))

    const toolCallSigns = output.filter(isToolCallSign)
    if (toolCallSigns.length === 0) return

    for (const toolCallSign of toolCallSigns) {
      const sign = await agent.toolRouter.run(toolCallSign, {
        signal: options.signal,
      })

      await agent.appendContext([sign])
      yield { type: "sign", sign }
    }

    if (options.signal?.aborted) return

    output = await agent.model.interpret(await agent.getContext())
  }
}
