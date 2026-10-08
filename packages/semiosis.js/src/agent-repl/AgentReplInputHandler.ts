import { agentInterpret, type Agent } from "../agent/index.ts"
import { formatSign } from "../format/index.ts"
import { UserSign } from "../sign/index.ts"
import { printAgentReplError } from "./shared.ts"
import type { Repl, ReplInputHandler } from "../repl/Repl.ts"

export function makeAgentReplInputHandler(
  agent: Agent,
  repl: Repl,
): ReplInputHandler {
  return async (input: string): Promise<void> => {
    const controller = new AbortController()

    const offCancel = repl.onCancel(() => {
      if (controller.signal.aborted) return

      repl.println(
        "[cancelling] user requested cancellation; stopping current tool...",
      )
      controller.abort()
    })

    try {
      repl.println("")

      for await (const sign of agentInterpret(agent, [UserSign(input)], {
        signal: controller.signal,
      })) {
        repl.println(formatSign(sign, { color: repl.useColor }))
      }
    } catch (error) {
      printAgentReplError(repl, error)
    } finally {
      offCancel()
    }
  }
}
