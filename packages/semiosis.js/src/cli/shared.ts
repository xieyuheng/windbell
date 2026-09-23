import Path from "node:path"
import type { Agent } from "../agent/index.ts"
import type { Database } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import { makeModel } from "../models/index.ts"
import { makeAgentFromSession, type Session } from "../session/index.ts"
import type { Sign } from "../sign/index.ts"
import type { ToolRouter } from "../tool/index.ts"
import type { Workspace } from "../workspace/Workspace.ts"
import { parseQualifiedName, readRequiredOption } from "./options.ts"

export async function makeModelFromOptions(options: {
  database: Database
  cliOptions: Record<string, unknown>
}): Promise<Model> {
  const modelSpec = readRequiredOption(options.cliOptions, "--model")
  const [providerName, modelName] = parseQualifiedName(modelSpec)

  return await makeModel({
    database: options.database,
    providerName,
    modelName,
  })
}

export async function ensureWorkspace(options: {
  database: Database
  cwd: string
}): Promise<Workspace> {
  const root = Path.resolve(options.cwd)

  return await options.database.workspaces.ensure({
    name: workspaceNameFromRoot(root),
    root,
  })
}

export function makeInitialSigns(
  toolRouter: ToolRouter,
  personaSign: Sign,
): Array<Sign> {
  return [...toolRouter.toolSigns, personaSign]
}

export async function getOrMakeSession(options: {
  database: Database
  sessionId?: string
  workspace: Workspace
  title: string
  initialSigns: Array<Sign>
}): Promise<Session> {
  if (options.sessionId !== undefined) {
    const session = await options.database.sessions.get(options.sessionId)
    if (session === undefined) {
      throw new Error(`session not found: ${options.sessionId}`)
    }

    if (session.workspaceId !== options.workspace.id) {
      throw new Error(
        `session workspace mismatch: ${options.sessionId} belongs to ${session.workspaceId}`,
      )
    }

    return session
  }

  const session = await options.database.sessions.make({
    workspaceId: options.workspace.id,
    title: options.title,
  })

  session.context = [...options.initialSigns]
  await options.database.sessions.put(session)
  return session
}

export async function makeAgentForCli(options: {
  database: Database
  sessionId: string
  model: Model
  toolRouter: ToolRouter
}): Promise<Agent> {
  return await makeAgentFromSession({
    database: options.database,
    sessionId: options.sessionId,
    model: options.model,
    makeToolRouter: () => options.toolRouter,
  })
}

function workspaceNameFromRoot(root: string): string {
  const resolved = Path.resolve(root)
  const name = Path.basename(resolved)
  return name === "" ? resolved : name
}
