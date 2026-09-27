import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type WorkspaceDustbinState = {
  workspaces: Array<S.DustbinWorkspace>
  sessionsByWorkspaceId: Record<S.WorkspaceId, Array<S.DustbinSessionIndex>>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeWorkspaceDustbinState(): WorkspaceDustbinState {
  return reactive<WorkspaceDustbinState>({
    workspaces: [],
    sessionsByWorkspaceId: {},
    loading: false,
    error: undefined,
  })
}

function groupSessionsByWorkspace(
  sessions: Array<S.DustbinSessionIndex>,
): Record<S.WorkspaceId, Array<S.DustbinSessionIndex>> {
  const grouped: Record<S.WorkspaceId, Array<S.DustbinSessionIndex>> = {}

  for (const session of sessions) {
    const workspaceSessions = grouped[session.workspaceId] ?? []
    workspaceSessions.push(session)
    grouped[session.workspaceId] = workspaceSessions
  }

  return grouped
}

export async function loadWorkspaceDustbin(
  state: WorkspaceDustbinState,
): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const [workspaces, sessions] = await Promise.all([
      semiosis.dustbin.workspaces.list(),
      semiosis.dustbin.sessions.list({ workspaceId: undefined }),
    ])

    state.workspaces = workspaces
    state.sessionsByWorkspaceId = groupSessionsByWorkspace(sessions)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function restoreWorkspace(
  state: WorkspaceDustbinState,
  workspaceId: S.WorkspaceId,
): Promise<void> {
  await semiosis.dustbin.workspaces.restore(workspaceId)
  state.workspaces = state.workspaces.filter(
    (workspace) => workspace.id !== workspaceId,
  )
  delete state.sessionsByWorkspaceId[workspaceId]
}

export async function removeWorkspace(
  state: WorkspaceDustbinState,
  workspaceId: S.WorkspaceId,
): Promise<void> {
  await semiosis.dustbin.workspaces.remove(workspaceId)
  state.workspaces = state.workspaces.filter(
    (workspace) => workspace.id !== workspaceId,
  )
  delete state.sessionsByWorkspaceId[workspaceId]
}
