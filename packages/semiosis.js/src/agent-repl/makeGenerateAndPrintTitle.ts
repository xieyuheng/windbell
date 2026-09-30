import type { Agent } from "../agent/index.ts"
import { formatWithBackground } from "../format/index.ts"
import { generateTitle } from "../session/index.ts"
import { printAgentReplError } from "./printAgentReplError.ts"
import type { Repl } from "../repl/Repl.ts"

export type MakeGenerateAndPrintTitleOptions = {
  agent: Agent
  repl: Repl
  onTitleChange?: (title: string) => Promise<void> | void
}

export function makeGenerateAndPrintTitle(
  options: MakeGenerateAndPrintTitleOptions,
): () => Promise<void> {
  const { agent, repl, onTitleChange } = options

  return async (): Promise<void> => {
    try {
      const title = await generateTitle({
        model: agent.model,
        context: await agent.getContext(),
      })

      await onTitleChange?.(title)

      const titleTag = repl.useColor
        ? formatWithBackground("[title]", 240)
        : "[title]"

      repl.println(`${titleTag}\n\n${title}\n`)
    } catch (error) {
      printAgentReplError(repl, error)
    }
  }
}
