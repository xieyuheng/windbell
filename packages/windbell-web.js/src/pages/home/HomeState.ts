import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type HomeState = {
  workspaces: Array<S.Workspace>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeHomeState(): HomeState {
  return reactive<HomeState>({
    workspaces: [],
    loading: false,
    error: undefined,
  })
}

export async function loadHomeState(state: HomeState): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    state.workspaces = await semiosis.workspaces.list()
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function ensureWorkspace(
  state: HomeState,
  options: {
    name: string
    root: string
  },
): Promise<S.Workspace> {
  const workspace = await semiosis.workspaces.ensure(options)
  const index = state.workspaces.findIndex((item) => item.id === workspace.id)

  if (index === -1) {
    state.workspaces.push(workspace)
  } else {
    state.workspaces[index] = workspace
  }

  return workspace
}

export async function trashWorkspace(
  state: HomeState,
  workspaceId: S.WorkspaceId,
): Promise<void> {
  await semiosis.dustbin.workspaces.trash(workspaceId)
  state.workspaces = state.workspaces.filter(
    (workspace) => workspace.id !== workspaceId,
  )
}

export async function updateWorkspaceTitle(
  state: HomeState,
  workspaceId: S.WorkspaceId,
  name: string,
): Promise<void> {
  const index = state.workspaces.findIndex(
    (workspace) => workspace.id === workspaceId,
  )
  const current = state.workspaces[index]

  if (current === undefined) return

  const workspace: S.Workspace = {
    ...current,
    name,
    updatedAt: Date.now(),
  }

  await semiosis.workspaces.put(workspace)
  state.workspaces[index] = workspace
}
