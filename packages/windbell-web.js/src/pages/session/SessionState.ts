import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type SessionState = {
  sessionId: S.SessionId
  workspaceId: S.WorkspaceId
  title: string
  context: Array<S.Sign>
  loading: boolean
  interpreting: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeSessionState(sessionId: S.SessionId): SessionState {
  return reactive<SessionState>({
    sessionId,
    workspaceId: "",
    title: "",
    context: [],
    loading: false,
    interpreting: false,
    error: undefined,
  })
}

export async function loadSessionState(
  state: SessionState,
  sessionId: S.SessionId,
): Promise<void> {
  state.sessionId = sessionId
  state.loading = true
  state.error = undefined

  try {
    const session = await semiosis.sessions.get(sessionId)

    if (session === undefined) {
      state.workspaceId = ""
      state.title = ""
      state.context = []
      state.error = `session not found: ${sessionId}`
      return
    }

    state.workspaceId = session.workspaceId
    state.title = session.title
    state.context = session.context
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function interpretSession(
  state: SessionState,
  content: string,
): Promise<void> {
  state.interpreting = true
  state.error = undefined

  try {
    const settings = await semiosis.settings.get()

    if (settings.defaultModel === null) {
      throw new Error("default model is not configured")
    }

    const input: S.UserSign = {
      kind: "UserSign",
      content,
    }

    state.context.push(input)

    for await (const sign of semiosis.sessions.interpret(state.sessionId, {
      model: {
        qualifiedName: settings.defaultModel.qualifiedName,
      },
      input: [input],
    })) {
      state.context.push(sign)
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.interpreting = false
  }
}
