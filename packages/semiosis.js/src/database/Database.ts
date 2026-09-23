import Path from "node:path"
import { makeModelStore, type ModelStore } from "./ModelStore.ts"
import { makeProviderStore, type ProviderStore } from "./ProviderStore.ts"
import { makeSessionStore, type SessionStore } from "./SessionStore.ts"
import { makeWorkspaceStore, type WorkspaceStore } from "./WorkspaceStore.ts"

export type DatabaseOptions = {
  root: string
}

export type Database = {
  root: string
  providers: ProviderStore
  models: ModelStore
  workspaces: WorkspaceStore
  sessions: SessionStore
}

export function makeDatabase(options: DatabaseOptions): Database {
  const root = options.root

  return {
    root,
    providers: makeProviderStore({
      root: Path.join(root, "providers"),
    }),
    models: makeModelStore({
      root: Path.join(root, "models"),
    }),
    workspaces: makeWorkspaceStore({
      root: Path.join(root, "workspaces"),
    }),
    sessions: makeSessionStore({
      root: Path.join(root, "sessions"),
    }),
  }
}
