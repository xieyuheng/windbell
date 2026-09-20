import { reactive } from "vue"
import type { Sign } from "@xieyuheng/semiosis.js"
import { mockSessions } from "../../mock/session"
import type { SessionId } from "../../models/Session"

export type SessionState = {
  sessionId: SessionId
  title: string
  signs: Array<Sign>
}

export function createSessionState(sessionId: SessionId): SessionState {
  const state = reactive<SessionState>({
    sessionId,
    title: "",
    signs: [],
  })

  loadSessionState(state, sessionId)
  return state
}

export function loadSessionState(
  state: SessionState,
  sessionId: SessionId,
): void {
  const session = mockSessions.find((item) => item.id === sessionId)

  state.sessionId = sessionId
  state.title = session?.title ?? ""
  state.signs = session?.signs ?? []
}
