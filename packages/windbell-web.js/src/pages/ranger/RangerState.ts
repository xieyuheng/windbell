import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

export type RangerState = {
  workspaceId: S.WorkspaceId
  workspace: S.Workspace | undefined
  root: string
  currentDirectory: string
  entries: Array<FileSystemEntry>
  loading: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

const fileSystem = makeFileSystemClient({
  baseUrl: "/api/fs",
})

export function makeRangerState(workspaceId: S.WorkspaceId): RangerState {
  return reactive<RangerState>({
    workspaceId,
    workspace: undefined,
    root: "",
    currentDirectory: "",
    entries: [],
    loading: false,
    error: undefined,
  })
}

export async function loadRanger(state: RangerState): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const workspace = await semiosis.workspaces.get(state.workspaceId)

    if (workspace === undefined) {
      state.workspace = undefined
      state.root = ""
      state.currentDirectory = ""
      state.entries = []
      state.error = `workspace not found: ${state.workspaceId}`
      return
    }

    state.workspace = workspace
    state.root = workspace.root

    await loadDirectory(state, workspace.root)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function loadDirectory(
  state: RangerState,
  path: string,
): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    state.entries = await fileSystem.listEntries(path)
    state.currentDirectory = path
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}
