import type * as S from "@xieyuheng/semiosis.js"
import { requestJson, requestJsonOptional } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

export type DustbinWorkspacesClient = {
  list(): Promise<Array<S.DustbinWorkspace>>
  get(id: S.WorkspaceId): Promise<S.DustbinWorkspace | undefined>
  trash(id: S.WorkspaceId): Promise<void>
  restore(id: S.WorkspaceId): Promise<void>
  remove(id: S.WorkspaceId): Promise<void>
}

export function makeDustbinWorkspacesClient(
  config: SemiosisClientConfig,
): DustbinWorkspacesClient {
  return {
    list: () =>
      requestJson<Array<S.DustbinWorkspace>>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: "/dustbin/workspaces",
      }),

    get: (id) =>
      requestJsonOptional<S.DustbinWorkspace>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/dustbin/workspaces/${encodeURIComponent(id)}`,
      }),

    trash: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "POST",
        path: "/dustbin/workspaces",
        body: { workspaceId: id },
      })
    },

    restore: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "POST",
        path: `/dustbin/workspaces/${encodeURIComponent(id)}/restore`,
      })
    },

    remove: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "DELETE",
        path: `/dustbin/workspaces/${encodeURIComponent(id)}`,
      })
    },
  }
}
