import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type DashboardState = {
  workspaces: Array<S.Workspace>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeDashboardState(): DashboardState {
  return reactive<DashboardState>({
    workspaces: [],
    loading: false,
    error: undefined,
  })
}

export async function loadDashboardState(state: DashboardState): Promise<void> {
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
  state: DashboardState,
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
