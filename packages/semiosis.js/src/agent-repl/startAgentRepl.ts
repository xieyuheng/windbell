import { createSession, makeAgentFromSession } from "../session/index.ts"
import { exitCommand } from "./commands/exitCommand.ts"
import { makeGenerateAndPrintTitle } from "./makeGenerateAndPrintTitle.ts"
import { infoCommand } from "./commands/infoCommand.ts"
import { titleCommand } from "./commands/titleCommand.ts"
import { makeAgentReplInputHandler } from "./AgentReplInputHandler.ts"
import type { Repl } from "../repl/Repl.ts"
import {
  makeInfoPrinter,
  makeInitialSigns,
  makeReplToolRouter,
  makeTitleChangeHandler,
  type AgentReplBaseOptions,
} from "./shared.ts"

export type StartAgentReplOptions = AgentReplBaseOptions & {
  repl: Repl
}

export async function startAgentRepl(
  options: StartAgentReplOptions,
): Promise<void> {
  const repl = options.repl

  try {
    const toolRouter = makeReplToolRouter(options)
    const initialSigns = makeInitialSigns(toolRouter)
    const firstInput = await readFirstInput(repl, "> ")

    if (firstInput === undefined) {
      repl.close()
      return
    }

    const session = await createSession({
      database: options.database,
      workspace: options.workspace,
      title: "untitled",
      initialSigns,
    })
    const agent = await makeAgentFromSession({
      database: options.database,
      sessionId: session.id,
      model: options.model,
      makeToolRouter: () => toolRouter,
    })
    const inputHandler = makeAgentReplInputHandler(agent, repl)
    const generateAndPrintTitle = makeGenerateAndPrintTitle({
      agent,
      repl,
      onTitleChange: makeTitleChangeHandler(options.database, session),
    })
    await inputHandler(firstInput)
    await generateAndPrintTitle()

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

async function readFirstInput(
  repl: Repl,
  prompt: string,
): Promise<string | undefined> {
  while (true) {
    const result = await repl.readInput(prompt)
    if (result.kind === "end") return undefined

    const line = result.input
    const input = line.trim()
    if (input === "") continue

    if (input === "/info" || input === "/title") {
      repl.println(`${input} is not available before a session is created.`)
      continue
    }

    return line
  }
}
