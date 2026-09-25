import process from "node:process"
import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import type { Model } from "../../model/index.ts"
import { startAgentRepl } from "../../repl/index.ts"
import type { Session } from "../../session/index.ts"
import { PersonaSign } from "../../sign/index.ts"
import { makeDefaultToolRouter } from "../../tools/index.ts"
import type { Workspace } from "../../workspace/Workspace.ts"
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

function printReplStartupInfo(options: {
  name: string
  version: string
  databaseRoot: string
  workspace: Workspace
  session: Session
  model: Model
}): void {
  console.log(`${options.name} ${options.version}`)
  console.log(`database: ${options.databaseRoot}`)
  console.log(`model: ${options.model.qualifiedName}`)
  console.log(`workspace: ${options.workspace.name}`)
  console.log(`  root: ${options.workspace.root}`)
  console.log(`session: ${options.session.title}`)
  console.log(`  id: ${options.session.id}`)
  console.log(`  context.length: ${options.session.context.length}`)
  console.log()
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

    printReplStartupInfo({
      name: context.router.name,
      version: context.router.version,
      databaseRoot: options.database.root,
      workspace,
      session,
      model,
    })

    return startAgentRepl(agent, {
      showContext: sessionId !== undefined,
    })
  }
}
