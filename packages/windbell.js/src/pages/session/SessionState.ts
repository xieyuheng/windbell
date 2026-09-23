import { reactive } from "vue"
import type * as S from "@xieyuheng/semiosis.js"
import { mockSessions } from "../../mock/session"

export type SessionState = {
  sessionId: S.SessionId
  title: string
  context: Array<S.Sign>
}

export function createSessionState(sessionId: S.SessionId): SessionState {
  const state = reactive<SessionState>({
    sessionId,
    title: "",
    context: [],
  })

  loadSessionState(state, sessionId)
  return state
}

export function loadSessionState(
  state: SessionState,
  sessionId: S.SessionId,
): void {
  const session = mockSessions.find((item) => item.id === sessionId)

  state.sessionId = sessionId
  state.title = session?.title ?? ""
  state.context = session?.context ?? []
}
