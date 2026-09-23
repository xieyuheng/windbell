import { reactive } from "vue"
import { mockWorkspaces } from "../../mock/workspace"
import type * as S from "@xieyuheng/semiosis.js"

export type WorkspaceListState = {
  workspaces: Array<S.Workspace>
}

export function makeWorkspaceListState(): WorkspaceListState {
  return reactive<WorkspaceListState>({
    workspaces: mockWorkspaces,
  })
}
