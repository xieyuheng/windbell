import { defineBasicLoader } from "vue-router/experimental"
import { getSessionState, loadSessionState } from "./SessionState.ts"

export const useSessionData = defineBasicLoader(async (to) => {
  const sessionId = String(to.params.sessionId ?? "")
  const state = getSessionState(sessionId)

  if (state.hasLoaded) {
    // 会话里可能在本地追加过 sign，不在这里做后台覆盖刷新。
    return state
  }

  await loadSessionState(state, sessionId)
  return state
})
