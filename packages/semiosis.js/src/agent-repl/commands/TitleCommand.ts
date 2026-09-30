import type { Agent } from "../../agent/index.ts"
import { formatWithBackground } from "../../format/index.ts"
import { generateTitle } from "../../session/index.ts"
import type { Repl, ReplCommand } from "../../repl/Repl.ts"
import { printAgentReplError } from "../shared.ts"

export async function generateAndPrintTitle(
  agent: Agent,
  repl: Repl,
  options: {
    onTitleChange?: (title: string) => Promise<void> | void
  },
): Promise<void> {
  try {
    const title = await generateTitle({
      model: agent.model,
      context: await agent.getContext(),
    })

    await options.onTitleChange?.(title)

    const titleTag = repl.useColor
      ? formatWithBackground("[title]", 240)
      : "[title]"

    repl.println(`${titleTag}\n\n${title}\n`)
  } catch (error) {
    printAgentReplError(repl, error)
  }
}

export function makeTitleCommand(
  agent: Agent,
  repl: Repl,
  options: {
    onTitleChange?: (title: string) => Promise<void> | void
  },
): ReplCommand {
  return {
    name: "title",
    handler: async () => {
      await generateAndPrintTitle(agent, repl, options)
    },
  }
}
