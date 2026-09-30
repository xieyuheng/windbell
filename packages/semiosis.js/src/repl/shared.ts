import type { Agent } from "../agent/index.ts"
import type { Database } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import { PersonaSign, type Sign } from "../sign/index.ts"
import { makeAgentFromSession, type Session } from "../session/index.ts"
import type { ToolRouter } from "../tool/index.ts"
import { makeDefaultToolRouter } from "../tools/index.ts"
import type { Workspace } from "../workspace/Workspace.ts"

export type AgentReplOptions = {
  database: Database
  workspace: Workspace
  model: Model
}

export function makeReplToolRouter(options: AgentReplOptions): ToolRouter {
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

export async function makeAgentForRepl(
  options: AgentReplOptions,
  session: Session,
  toolRouter: ToolRouter,
): Promise<Agent> {
  return makeAgentFromSession({
    database: options.database,
    sessionId: session.id,
    model: options.model,
    makeToolRouter: () => toolRouter,
  })
}

export function makeInfoPrinter(
  options: AgentReplOptions,
  agent: Agent,
  session: Session,
): () => Promise<void> {
  return async () => {
    const context = await agent.getContext()

    console.log(`database: ${options.database.root}`)
    console.log(`model: ${options.model.qualifiedName}`)
    console.log(`workspace: ${options.workspace.name}`)
    console.log(`  root: ${options.workspace.root}`)
    console.log(`session: ${session.title}`)
    console.log(`  id: ${session.id}`)
    console.log(`  context.length: ${context.length}`)
    console.log()
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
