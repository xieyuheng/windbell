import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional, streamCall, withQuery } from "./http.ts"

export type MakeSessionOptions = {
  workspaceId: S.WorkspaceId
  title: string
}

export type ListSessionsOptions = {
  workspaceId: S.WorkspaceId | undefined
}

export type InterpretOptions = {
  model: {
    qualifiedName: string
  }
  input: Array<S.Sign>
}

export type InterpretEvent =
  | { type: "sign"; sign: S.Sign }
  | { type: "done" }
  | { type: "error"; message: string }

export type SessionsClient = {
  list(options: ListSessionsOptions): Promise<Array<S.SessionIndex>>
  make(options: MakeSessionOptions): Promise<S.Session>
  get(id: S.SessionId): Promise<S.Session | undefined>
  put(session: S.Session): Promise<void>
  interpret(id: S.SessionId, options: InterpretOptions): AsyncGenerator<S.Sign>
  remove(id: S.SessionId): Promise<void>
}

export function makeSessionsClient(
  config: SemiosisClientConfig,
): SessionsClient {
  return {
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

    async *interpret(id, options) {
      for await (const event of streamCall<InterpretEvent>(
        config.baseUrl,
        "POST",
        `/sessions/${encodeURIComponent(id)}/interpret`,
        options,
      )) {
        if (event.type === "sign") {
          yield event.sign
        } else if (event.type === "error") {
          throw new Error(event.message)
        } else if (event.type === "done") {
          return
        }
      }
    },

    remove: async (id) => {
      await call(
        config.baseUrl,
        "DELETE",
        `/sessions/${encodeURIComponent(id)}`,
      )
    },
  }
}
