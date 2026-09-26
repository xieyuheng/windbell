import type * as S from "@xieyuheng/semiosis.js"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import { call, callOptional } from "./http.ts"

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
  }
}
