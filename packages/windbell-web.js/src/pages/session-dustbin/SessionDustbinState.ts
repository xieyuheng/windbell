import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type SessionDustbinListItem = S.DustbinSessionIndex & {
  context: Array<S.Sign>
}

export type SessionDustbinState = {
  workspaceId: S.WorkspaceId
  sessions: Array<SessionDustbinListItem>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeSessionDustbinState(
  workspaceId: S.WorkspaceId,
): SessionDustbinState {
  return reactive<SessionDustbinState>({
    workspaceId,
    sessions: [],
    loading: false,
    error: undefined,
  })
}

export async function loadSessionDustbin(
  state: SessionDustbinState,
): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const sessions = await semiosis.dustbin.sessions.list({
      workspaceId: state.workspaceId,
    })

    state.sessions = await Promise.all(
      sessions.map(async (session) => {
        const detail = await semiosis.dustbin.sessions.get(session.id)
        return {
          ...session,
          context: detail?.context ?? [],
        }
      }),
    )
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function restoreSession(
  state: SessionDustbinState,
  sessionId: S.SessionId,
): Promise<void> {
  await semiosis.dustbin.sessions.restore(sessionId)
  state.sessions = state.sessions.filter((session) => session.id !== sessionId)
}

export async function removeSession(
  state: SessionDustbinState,
  sessionId: S.SessionId,
): Promise<void> {
  await semiosis.dustbin.sessions.remove(sessionId)
  state.sessions = state.sessions.filter((session) => session.id !== sessionId)
}
