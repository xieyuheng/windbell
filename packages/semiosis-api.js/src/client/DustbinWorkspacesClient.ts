import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional } from "./http.ts"

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
    list: () => call(config.baseUrl, "GET", "/dustbin/workspaces"),

    get: (id) =>
      callOptional(
        config.baseUrl,
        "GET",
        `/dustbin/workspaces/${encodeURIComponent(id)}`,
      ),

    trash: async (id) => {
      await call(config.baseUrl, "POST", "/dustbin/workspaces", {
        workspaceId: id,
      })
    },

    restore: async (id) => {
      await call(
        config.baseUrl,
        "POST",
        `/dustbin/workspaces/${encodeURIComponent(id)}/restore`,
      )
    },

    remove: async (id) => {
      await call(
        config.baseUrl,
        "DELETE",
        `/dustbin/workspaces/${encodeURIComponent(id)}`,
      )
    },
  }
}
