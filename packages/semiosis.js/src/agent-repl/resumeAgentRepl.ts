import { formatSign } from "../format/index.ts"
import {
  loadSession,
  makeAgentFromSession,
  type SessionId,
} from "../session/index.ts"
import { exitCommand } from "./commands/exitCommand.ts"
import { makeGenerateAndPrintTitle } from "./makeGenerateAndPrintTitle.ts"
import { infoCommand } from "./commands/infoCommand.ts"
import { titleCommand } from "./commands/titleCommand.ts"
import { makeAgentReplInputHandler } from "./AgentReplInputHandler.ts"
import type { Repl } from "../repl/Repl.ts"
import {
  makeInfoPrinter,
  makeReplToolRouter,
  makeTitleChangeHandler,
  type AgentReplBaseOptions,
} from "./shared.ts"

export type ResumeAgentReplOptions = AgentReplBaseOptions & {
  repl: Repl
  sessionId: SessionId
}

export async function resumeAgentRepl(
  options: ResumeAgentReplOptions,
): Promise<void> {
  const toolRouter = makeReplToolRouter(options)
  const session = await loadSession({
    database: options.database,
    workspace: options.workspace,
    sessionId: options.sessionId,
  })
  const agent = await makeAgentFromSession({
    database: options.database,
    sessionId: session.id,
    model: options.model,
    makeToolRouter: () => toolRouter,
  })
  const repl = options.repl

  try {
    for (const sign of await agent.getContext()) {
      repl.println(formatSign(sign, { color: repl.useColor }))
    }

    const inputHandler = makeAgentReplInputHandler(agent, repl)
    const generateAndPrintTitle = makeGenerateAndPrintTitle({
      agent,
      repl,
      onTitleChange: makeTitleChangeHandler(options.database, session),
    })
    repl.registerCommand(exitCommand())
    repl.registerCommand(titleCommand(generateAndPrintTitle))
    repl.registerCommand(
      infoCommand(makeInfoPrinter(repl, options, agent, session)),
    )

    await repl.run(inputHandler, "> ")
  } catch (error) {
    repl.close()
    throw error
  }
}
