import type { Agent } from "../agent/index.ts"
import type { Database } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import { PersonaSign, type Sign } from "../sign/index.ts"
import type { Session } from "../session/index.ts"
import type { ToolRouter } from "../tool/index.ts"
import { makeDefaultToolRouter } from "../tools/index.ts"
import type { Workspace } from "../workspace/Workspace.ts"
import type { Repl } from "../repl/Repl.ts"

export type AgentReplBaseOptions = {
  database: Database
  workspace: Workspace
  model: Model
}

export function makeReplToolRouter(options: AgentReplBaseOptions): ToolRouter {
  return makeDefaultToolRouter({
    cwd: options.workspace.root,
  })
}

export function makeInitialSigns(toolRouter: ToolRouter): Array<Sign> {
  const personaSign = PersonaSign(
    "You are a helpful software engineer assistant.",
  )
  return [...toolRouter.toolSigns, personaSign]
}

export function makeInfoPrinter(
  repl: Repl,
  options: AgentReplBaseOptions,
  agent: Agent,
  session: Session,
): () => Promise<void> {
  return async () => {
    const context = await agent.getContext()

    repl.println(`database: ${options.database.root}`)
    repl.println(`model: ${options.model.qualifiedName}`)
    repl.println(`workspace: ${options.workspace.name}`)
    repl.println(`  root: ${options.workspace.root}`)
    repl.println(`session: ${session.title}`)
    repl.println(`  id: ${session.id}`)
    repl.println(`  context.length: ${context.length}`)
    repl.println("")
  }
}

export function makeTitleChangeHandler(
  database: Database,
  session: Session,
): (title: string) => Promise<void> {
  return async (title) => {
    await database.sessions.updateTitle(session.id, title)
    session.title = title
  }
}
