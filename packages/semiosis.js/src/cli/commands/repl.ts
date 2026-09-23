import process from "node:process"
import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { startAgentRepl } from "../../repl/index.ts"
import { PersonaSign } from "../../sign/index.ts"
import { makeDefaultToolRouter } from "../../tools/index.ts"
import { readOptionalOption } from "../options.ts"
import {
  ensureWorkspace,
  getOrMakeSession,
  makeAgentForCli,
  makeInitialSigns,
  makeModelFromOptions,
} from "../shared.ts"

export type ReplCommandOptions = {
  database: Database
}

export function makeReplHandler(options: ReplCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const model = await makeModelFromOptions({
      database: options.database,
      cliOptions: context.options,
    })
    const workspace = await ensureWorkspace({
      database: options.database,
      cwd: process.cwd(),
    })

    const toolRouter = makeDefaultToolRouter({ cwd: workspace.root })
    const personaSign = PersonaSign(
      "You are a helpful software engineer assistant.",
    )
    const initialSigns = makeInitialSigns(toolRouter, personaSign)

    const sessionId = readOptionalOption(context.options, "--session")
    const session = await getOrMakeSession({
      database: options.database,
      sessionId,
      workspace,
      title: "untitled",
      initialSigns,
    })

    const agent = await makeAgentForCli({
      database: options.database,
      sessionId: session.id,
      model,
      toolRouter,
    })

    return startAgentRepl(agent, {
      showContext: sessionId !== undefined,
    })
  }
}
