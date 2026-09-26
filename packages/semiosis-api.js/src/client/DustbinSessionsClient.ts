import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional, withQuery } from "./http.ts"

export type ListDustbinSessionsOptions = {
  workspaceId: S.WorkspaceId | undefined
}

export type DustbinSessionsClient = {
  list(
    options: ListDustbinSessionsOptions,
  ): Promise<Array<S.DustbinSessionIndex>>
  get(sessionId: S.SessionId): Promise<S.Session | undefined>
  trash(sessionId: S.SessionId): Promise<void>
  restore(sessionId: S.SessionId): Promise<void>
  remove(sessionId: S.SessionId): Promise<void>
}

export function makeDustbinSessionsClient(
  config: SemiosisClientConfig,
): DustbinSessionsClient {
  return {
    list: (options) => {
      const query = new URLSearchParams()
      if (options.workspaceId !== undefined) {
        query.set("workspaceId", options.workspaceId)
      }

      return call(config.baseUrl, "GET", withQuery("/dustbin/sessions", query))
    },

    get: (id) =>
      callOptional(
        config.baseUrl,
        "GET",
        `/dustbin/sessions/${encodeURIComponent(id)}`,
      ),

    trash: async (id) => {
      await call(config.baseUrl, "POST", "/dustbin/sessions", {
        sessionId: id,
      })
    },

    restore: async (id) => {
      await call(
        config.baseUrl,
        "POST",
        `/dustbin/sessions/${encodeURIComponent(id)}/restore`,
      )
    },

    remove: async (id) => {
      await call(
        config.baseUrl,
        "DELETE",
        `/dustbin/sessions/${encodeURIComponent(id)}`,
      )
    },
  }
}
