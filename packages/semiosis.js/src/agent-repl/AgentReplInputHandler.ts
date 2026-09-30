import { agentInterpret, type Agent } from "../agent/index.ts"
import { formatSign } from "../format/index.ts"
import { UserSign } from "../sign/index.ts"
import { printAgentReplError } from "./printAgentReplError.ts"
import type { Repl, ReplInputHandler } from "../repl/Repl.ts"

export function makeAgentReplInputHandler(
  agent: Agent,
  repl: Repl,
): ReplInputHandler {
  return async (input: string): Promise<void> => {
    try {
      repl.println("")
      for await (const sign of agentInterpret(agent, [UserSign(input)])) {
        repl.println(formatSign(sign, { color: repl.useColor }))
      }
    } catch (error) {
      printAgentReplError(repl, error)
    }
  }
}
