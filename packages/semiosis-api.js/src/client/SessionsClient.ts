import type * as S from "@xieyuheng/semiosis.js"
import {
  requestJson,
  requestJsonOptional,
  requestNdjson,
} from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

export type MakeSessionOptions = {
  workspaceId: S.WorkspaceId
  title: string
}

export type ListSessionsOptions = {
  workspaceId: S.WorkspaceId | undefined
}

export type GenerateTitleOptions = {
  model: S.ModelRef
}

export type InterpretOptions = {
  model: S.ModelRef
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
  generateTitle(id: S.SessionId, options: GenerateTitleOptions): Promise<string>
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

      return requestJson<Array<S.SessionIndex>>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: "/sessions",
        query,
      })
    },

    make: (options) =>
      requestJson<S.Session>({
        baseUrl: config.baseUrl,
        method: "POST",
        path: "/sessions",
        body: options,
      }),

    get: (id) =>
      requestJsonOptional<S.Session>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/sessions/${encodeURIComponent(id)}`,
      }),

    put: async (session) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "PUT",
        path: `/sessions/${encodeURIComponent(session.id)}`,
        body: session,
      })
    },

    generateTitle: async (id, options) => {
      const result = await requestJson<{ title: string }>({
        baseUrl: config.baseUrl,
        method: "POST",
        path: `/sessions/${encodeURIComponent(id)}/title`,
        body: options,
      })

      return result.title
    },

    async *interpret(id, options) {
      for await (const event of requestNdjson<InterpretEvent>({
        baseUrl: config.baseUrl,
        method: "POST",
        path: `/sessions/${encodeURIComponent(id)}/interpret`,
        body: options,
      })) {
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
      await requestJson({
        baseUrl: config.baseUrl,
        method: "DELETE",
        path: `/sessions/${encodeURIComponent(id)}`,
      })
    },
  }
}
