import type * as S from "@xieyuheng/semiosis.js"
import { requestJson, requestJsonOptional } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

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

      return requestJson<Array<S.DustbinSessionIndex>>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: "/dustbin/sessions",
        query,
      })
    },

    get: (id) =>
      requestJsonOptional<S.Session>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/dustbin/sessions/${encodeURIComponent(id)}`,
      }),

    trash: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "POST",
        path: "/dustbin/sessions",
        body: { sessionId: id },
      })
    },

    restore: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "POST",
        path: `/dustbin/sessions/${encodeURIComponent(id)}/restore`,
      })
    },

    remove: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "DELETE",
        path: `/dustbin/sessions/${encodeURIComponent(id)}`,
      })
    },
  }
}
