import { makeSemiosisClient } from "@windbell/semiosis-api.js/client"
import type * as S from "@windbell/semiosis.js"
import { reactive } from "vue"

export type SessionState = {
  sessionId: S.SessionId
  workspaceId: S.WorkspaceId
  workspaceRoot: string
  title: string
  context: Array<S.Sign>
  modelRef: S.ModelRef | undefined
  hasLoaded: boolean
  isLoading: boolean
  isPending: boolean
  requestId: number
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
    hasLoaded: false,
    isLoading: true,
    isPending: false,
    requestId: 0,
    interpreting: false,
    error: undefined,
  })
}

const sessionStates = new Map<S.SessionId, SessionState>()
const interpretationControllers = new Map<S.SessionId, AbortController>()

export function cancelSessionInterpretation(state: SessionState): void {
  interpretationControllers.get(state.sessionId)?.abort()
}

export function getSessionState(sessionId: S.SessionId): SessionState {
  let state = sessionStates.get(sessionId)

  if (state === undefined) {
    state = makeSessionState(sessionId)
    sessionStates.set(sessionId, state)
  }

  return state
}

export async function loadSessionState(
  state: SessionState,
  sessionId: S.SessionId,
): Promise<void> {
  const requestId = ++state.requestId
  state.sessionId = sessionId

  if (state.hasLoaded) {
    state.isPending = true
  } else {
    state.isLoading = true
  }

  state.error = undefined

  try {
    const session = await semiosis.sessions.get(sessionId)

    if (requestId !== state.requestId) return

    if (session === undefined) {
      state.title = ""
      state.context = []
      state.workspaceId = ""
      state.workspaceRoot = ""
      state.modelRef = undefined
      state.error = `session not found: ${sessionId}`
      return
    }

    const workspace = await semiosis.workspaces.get(session.workspaceId)

    if (requestId !== state.requestId) return

    if (workspace === undefined) {
      state.error = `workspace not found: ${session.workspaceId}`
      return
    }

    state.workspaceId = session.workspaceId
    state.title = session.title
    state.context = session.context
    state.workspaceRoot = workspace.root
    state.hasLoaded = true
  } catch (error) {
    if (requestId !== state.requestId) return

    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    if (requestId === state.requestId) {
      state.isLoading = false
      state.isPending = false
    }
  }
}

export async function interpretSession(
  state: SessionState,
  content: string,
  options: { signal?: AbortSignal } = {},
): Promise<boolean> {
  state.interpreting = true
  state.error = undefined

  const controller =
    options.signal === undefined ? new AbortController() : undefined
  const signal = options.signal ?? controller?.signal

  if (controller !== undefined) {
    interpretationControllers.set(state.sessionId, controller)
  }

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
    const turnId = `turn-${crypto.randomUUID()}`

    for await (const event of semiosis.sessions.interpret({
      sessionId: state.sessionId,
      model: modelRef,
      turnId,
      input: [input],
      signal,
    })) {
      if (event.type === "error") {
        state.error = event.error.message
        return false
      }

      state.context.push(event.sign)
    }

    return true
  } catch (error) {
    if (signal?.aborted) return false

    state.error = error instanceof Error ? error.message : String(error)
    return false
  } finally {
    if (
      controller !== undefined &&
      interpretationControllers.get(state.sessionId) === controller
    ) {
      interpretationControllers.delete(state.sessionId)
    }

    state.interpreting = false
  }
}

export async function generateSessionTitle(state: SessionState): Promise<void> {
  if (state.modelRef === undefined) return

  try {
    const title = (
      await semiosis.sessions.generateTitle({
        sessionId: state.sessionId,
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
