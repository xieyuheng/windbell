import Path from "node:path"
import type { Agent } from "../agent/index.ts"
import type { Database } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import { makeModel } from "../models/index.ts"
import { makeAgentFromSession } from "../session/index.ts"
import type { ToolRouter } from "../tool/index.ts"
import type { Workspace } from "../workspace/Workspace.ts"
import { readRequiredOption } from "./options.ts"

export async function makeModelFromOptions(options: {
  database: Database
  cliOptions: Record<string, unknown>
}): Promise<Model> {
  const qualifiedName = readRequiredOption(options.cliOptions, "--model")

  return await makeModel(qualifiedName, {
    database: options.database,
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
