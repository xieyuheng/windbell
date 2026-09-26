import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type SessionListState = {
  workspaceId: S.WorkspaceId
  workspace: S.Workspace | undefined
  sessions: Array<S.Session>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeSessionListState(
  workspaceId: S.WorkspaceId,
): SessionListState {
  return reactive<SessionListState>({
    workspaceId,
    workspace: undefined,
    sessions: [],
    loading: false,
    error: undefined,
  })
}

export async function loadSessionList(state: SessionListState): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const [workspace, sessions] = await Promise.all([
      semiosis.workspaces.get(state.workspaceId),
      semiosis.sessions.list({
        workspaceId: state.workspaceId,
      }),
    ])

    state.workspace = workspace
    state.sessions = (
      await Promise.all(
        sessions.map((session) => semiosis.sessions.get(session.id)),
      )
    ).filter((session): session is S.Session => session !== undefined)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function makeSession(
  state: SessionListState,
  title: string,
): Promise<S.Session> {
  const session = await semiosis.sessions.make({
    workspaceId: state.workspaceId,
    title,
  })

  state.sessions.push(session)
  return session
}
