import type * as S from "@xieyuheng/semiosis.js"
export type SemiosisClientConfig = {
  baseUrl: string
}

export type EnsureWorkspaceOptions = {
  name: string
  root: string
}

export type MakeSessionOptions = {
  workspaceId: S.WorkspaceId
  title: string
}

export type ListSessionsOptions = {
  workspaceId: S.WorkspaceId | undefined
}

export type SemiosisClient = {
  health(): Promise<{
    ok: boolean
    service: string
  }>

  workspaces: {
    list(): Promise<Array<S.Workspace>>
    ensure(options: EnsureWorkspaceOptions): Promise<S.Workspace>
    get(id: S.WorkspaceId): Promise<S.Workspace | undefined>
    put(workspace: S.Workspace): Promise<void>
    remove(id: S.WorkspaceId): Promise<void>
  }

  sessions: {
    list(options: ListSessionsOptions): Promise<Array<S.SessionIndex>>
    make(options: MakeSessionOptions): Promise<S.Session>
    get(id: S.SessionId): Promise<S.Session | undefined>
    put(session: S.Session): Promise<void>
    appendSign(id: S.SessionId, sign: S.Sign): Promise<void>
    remove(id: S.SessionId): Promise<void>
  }
}

export function makeSemiosisClient(
  config: SemiosisClientConfig,
): SemiosisClient {
  return {
    health: () => call(config.baseUrl, "GET", "/health"),

    workspaces: {
      list: () => call(config.baseUrl, "GET", "/workspaces"),

      ensure: (options) =>
        call(config.baseUrl, "POST", "/workspaces/ensure", options),

      get: (id) =>
        callOptional(
          config.baseUrl,
          "GET",
          `/workspaces/${encodeURIComponent(id)}`,
        ),

      put: async (workspace) => {
        await call(
          config.baseUrl,
          "PUT",
          `/workspaces/${encodeURIComponent(workspace.id)}`,
          workspace,
        )
      },

      remove: async (id) => {
        await call(
          config.baseUrl,
          "DELETE",
          `/workspaces/${encodeURIComponent(id)}`,
        )
      },
    },

    sessions: {
      list: (options) => {
        const query = new URLSearchParams()
        if (options.workspaceId !== undefined) {
          query.set("workspaceId", options.workspaceId)
        }

        return call(config.baseUrl, "GET", withQuery("/sessions", query))
      },

      make: (options) => call(config.baseUrl, "POST", "/sessions", options),

      get: (id) =>
        callOptional(
          config.baseUrl,
          "GET",
          `/sessions/${encodeURIComponent(id)}`,
        ),

      put: async (session) => {
        await call(
          config.baseUrl,
          "PUT",
          `/sessions/${encodeURIComponent(session.id)}`,
          session,
        )
      },

      appendSign: async (id, sign) => {
        await call(
          config.baseUrl,
          "POST",
          `/sessions/${encodeURIComponent(id)}/signs`,
          { sign },
        )
      },

      remove: async (id) => {
        await call(
          config.baseUrl,
          "DELETE",
          `/sessions/${encodeURIComponent(id)}`,
        )
      },
    },
  }
}

class HttpRequestError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "HttpRequestError"
    this.status = status
  }
}

async function call<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(joinUrl(baseUrl, path), {
    method,
    headers:
      body === undefined
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const value = text === "" ? null : parseJson(text)

  if (!response.ok) {
    throw new HttpRequestError(response.status, readErrorMessage(value, text))
  }

  return value as T
}

async function callOptional<T>(
  baseUrl: string,
  method: string,
  path: string,
): Promise<T | undefined> {
  try {
    return await call<T>(baseUrl, method, path)
  } catch (error) {
    if (error instanceof HttpRequestError && error.status === 404) {
      return undefined
    }

    throw error
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function readErrorMessage(value: unknown, text: string): string {
  if (value !== null && typeof value === "object") {
    const error = (value as { error?: unknown }).error
    if (error !== null && typeof error === "object") {
      const message = (error as { message?: unknown }).message
      if (typeof message === "string") return message
    }
  }

  return text
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`
}

function withQuery(path: string, query: URLSearchParams): string {
  const text = query.toString()
  return text === "" ? path : `${path}?${text}`
}
