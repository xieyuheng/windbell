import Path from "node:path"
import {
  makeDustbinSessionStore,
  type DustbinSessionStore,
} from "./DustbinSessionStore.ts"
import {
  makeDustbinWorkspaceStore,
  type DustbinWorkspaceStore,
} from "./DustbinWorkspaceStore.ts"
import { makeSettingsStore, type SettingsStore } from "./SettingsStore.ts"
import { makeSessionStore, type SessionStore } from "./SessionStore.ts"
import { makeWorkspaceStore, type WorkspaceStore } from "./WorkspaceStore.ts"

export type DatabaseOptions = {
  root: string
}

export type Database = {
  root: string
  providersRoot: string
  settings: SettingsStore
  workspaces: WorkspaceStore
  sessions: SessionStore
  dustbin: {
    sessions: DustbinSessionStore
    workspaces: DustbinWorkspaceStore
  }
}

export function makeDatabase(options: DatabaseOptions): Database {
  const root = options.root
  const providersRoot = Path.join(root, "providers")
  const workspaces = makeWorkspaceStore({
    root: Path.join(root, "workspaces"),
  })
  const sessions = makeSessionStore({
    root: Path.join(root, "sessions"),
    async onSessionUpdated(session) {
      const workspace = await workspaces.get(session.workspaceId)
      if (workspace === undefined) return

      const updatedAt = Math.max(workspace.updatedAt, session.updatedAt)
      if (updatedAt === workspace.updatedAt) return

      await workspaces.put({
        ...workspace,
        updatedAt,
      })
    },
  })

  return {
    root,
    providersRoot,
    settings: makeSettingsStore({
      root,
    }),
    workspaces,
    sessions,
    dustbin: {
      sessions: makeDustbinSessionStore({
        sessionsRoot: Path.join(root, "sessions"),
        dustbinSessionsRoot: Path.join(root, "dustbin", "sessions"),
      }),
      workspaces: makeDustbinWorkspaceStore({
        workspacesRoot: Path.join(root, "workspaces"),
        dustbinWorkspacesRoot: Path.join(root, "dustbin", "workspaces"),
      }),
    },
  }
}
