import type * as S from "@xieyuheng/semiosis.js"
import { requestJson, requestJsonOptional } from "@xieyuheng/http.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"

export type EnsureWorkspaceOptions = {
  name: string
  root: string
}

export type WorkspacesClient = {
  list(): Promise<Array<S.Workspace>>
  ensure(options: EnsureWorkspaceOptions): Promise<S.Workspace>
  get(id: S.WorkspaceId): Promise<S.Workspace | undefined>
  put(workspace: S.Workspace): Promise<void>
  remove(id: S.WorkspaceId): Promise<void>
}

export function makeWorkspacesClient(
  config: SemiosisClientConfig,
): WorkspacesClient {
  return {
    list: () =>
      requestJson<Array<S.Workspace>>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: "/workspaces",
      }),

    ensure: (options) =>
      requestJson<S.Workspace>({
        baseUrl: config.baseUrl,
        method: "POST",
        path: "/workspaces/ensure",
        body: options,
      }),

    get: (id) =>
      requestJsonOptional<S.Workspace>({
        baseUrl: config.baseUrl,
        method: "GET",
        path: `/workspaces/${encodeURIComponent(id)}`,
      }),

    put: async (workspace) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "PUT",
        path: `/workspaces/${encodeURIComponent(workspace.id)}`,
        body: workspace,
      })
    },

    remove: async (id) => {
      await requestJson({
        baseUrl: config.baseUrl,
        method: "DELETE",
        path: `/workspaces/${encodeURIComponent(id)}`,
      })
    },
  }
}
