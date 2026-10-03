import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type SessionState = {
  sessionId: S.SessionId
  workspaceId: S.WorkspaceId
  workspaceRoot: string
  title: string
  context: Array<S.Sign>
  modelRef: S.ModelRef | undefined
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
    workspaceRoot: "",
    title: "",
    context: [],
    modelRef: undefined,
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
  state.workspaceId = ""
  state.workspaceRoot = ""
  state.modelRef = undefined
  state.loading = true
  state.error = undefined

  try {
    const session = await semiosis.sessions.get(sessionId)

    if (session === undefined) {
      state.title = ""
      state.context = []
      state.error = `session not found: ${sessionId}`
      return
    }

    state.workspaceId = session.workspaceId
    state.title = session.title
    state.context = session.context

    const workspace = await semiosis.workspaces.get(session.workspaceId)

    if (workspace === undefined) {
      state.error = `workspace not found: ${session.workspaceId}`
      return
    }

    state.workspaceRoot = workspace.root
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function interpretSession(
  state: SessionState,
  content: string,
): Promise<boolean> {
  state.interpreting = true
  state.error = undefined

  try {
    const settings = await semiosis.settings.get()
    const providerName = settings.defaultProvider

    if (providerName === null) {
      throw new Error("default provider is not configured")
    }

    const providerConfig = await semiosis.providers.get(providerName)

    if (providerConfig === undefined) {
      throw new Error(`provider not found: ${providerName}`)
    }

    if (providerConfig.defaultModel === null) {
      throw new Error(`default model is not configured: ${providerName}`)
    }

    const modelRef: S.ModelRef = {
      providerName: providerConfig.name,
      name: providerConfig.defaultModel,
    }

    state.modelRef = modelRef

    const input: S.UserSign = {
      kind: "UserSign",
      content,
    }

    state.context.push(input)

    for await (const sign of semiosis.sessions.interpret(state.sessionId, {
      model: modelRef,
      input: [input],
    })) {
      state.context.push(sign)
    }

    return true
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    return false
  } finally {
    state.interpreting = false
  }
}

export async function generateSessionTitle(state: SessionState): Promise<void> {
  if (state.modelRef === undefined) return

  try {
    const title = (
      await semiosis.sessions.generateTitle(state.sessionId, {
        model: state.modelRef,
      })
    ).trim()

    if (title !== "") {
      state.title = title
    }
  } catch {
    // Title generation is best-effort and should not block the conversation.
  }
}
