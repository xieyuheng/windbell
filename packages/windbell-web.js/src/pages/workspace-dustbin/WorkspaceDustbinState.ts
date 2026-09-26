import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type WorkspaceDustbinState = {
  workspaces: Array<S.DustbinWorkspace>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeWorkspaceDustbinState(): WorkspaceDustbinState {
  return reactive<WorkspaceDustbinState>({
    workspaces: [],
    loading: false,
    error: undefined,
  })
}

export async function loadWorkspaceDustbin(
  state: WorkspaceDustbinState,
): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    state.workspaces = await semiosis.dustbin.workspaces.list()
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function restoreWorkspace(
  state: WorkspaceDustbinState,
  workspaceId: S.WorkspaceId,
): Promise<void> {
  await semiosis.dustbin.workspaces.restore(workspaceId)
  state.workspaces = state.workspaces.filter(
    (workspace) => workspace.id !== workspaceId,
  )
}

export async function removeWorkspace(
  state: WorkspaceDustbinState,
  workspaceId: S.WorkspaceId,
): Promise<void> {
  await semiosis.dustbin.workspaces.remove(workspaceId)
  state.workspaces = state.workspaces.filter(
    (workspace) => workspace.id !== workspaceId,
  )
}
