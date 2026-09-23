import Path from "node:path"
import { makeSessionStore, type SessionStore } from "./SessionStore.ts"
import { makeWorkspaceStore, type WorkspaceStore } from "./WorkspaceStore.ts"
import { defaultDatabaseRoot } from "./defaultDatabaseRoot.ts"

export type DatabaseOptions = {
  root?: string
}

export type Database = {
  root: string
  workspaces: WorkspaceStore
  sessions: SessionStore
}

export function makeDatabase(options: DatabaseOptions = {}): Database {
  const root = options.root ?? defaultDatabaseRoot()

  return {
    root,
    workspaces: makeWorkspaceStore({
      root: Path.join(root, "workspaces"),
    }),
    sessions: makeSessionStore({
      root: Path.join(root, "sessions"),
    }),
  }
}
