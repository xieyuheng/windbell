import { reactive } from "vue"
import { mockWorkspaces } from "../../mock/workspace"
import type { Workspace } from "../../models/Workspace"

export type WorkspaceListState = {
  workspaces: Array<Workspace>
}

export function createWorkspaceListState(): WorkspaceListState {
  return reactive<WorkspaceListState>({
    workspaces: mockWorkspaces,
  })
}
