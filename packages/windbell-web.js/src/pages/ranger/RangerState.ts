import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"
import { isSamePath, parentPath } from "./RangerPath"

export type RangerFocus = "sidebar" | "view"

export type RangerState = {
  workspaceId: S.WorkspaceId
  workspace: S.Workspace | undefined
  root: string
  currentDirectory: string
  entries: Array<FileSystemEntry>
  selectedIndex: number
  selectedEntry: FileSystemEntry | undefined
  focus: RangerFocus
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
    selectedIndex: -1,
    selectedEntry: undefined,
    focus: "sidebar",
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
      state.selectedIndex = -1
      state.selectedEntry = undefined
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

export type LoadDirectoryOptions = {
  selectPath?: string
}

export async function loadDirectory(
  state: RangerState,
  path: string,
  options: LoadDirectoryOptions = {},
): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const entries = await fileSystem.listEntries(path)

    state.entries = entries
    state.currentDirectory = path

    const selectedIndex =
      options.selectPath === undefined
        ? 0
        : entries.findIndex((entry) => entry.path === options.selectPath)
    const index = selectedIndex === -1 ? 0 : selectedIndex

    state.selectedIndex = entries.length > 0 ? index : -1
    state.selectedEntry = entries[index]
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export function selectEntry(state: RangerState, index: number): void {
  if (index < 0 || index >= state.entries.length) return

  state.selectedIndex = index
  state.selectedEntry = state.entries[index]
}

export function moveSelection(state: RangerState, delta: number): void {
  if (state.entries.length === 0) return

  const index = state.selectedIndex + delta
  if (index < 0 || index >= state.entries.length) return

  selectEntry(state, index)
}

export async function openSelectedEntry(state: RangerState): Promise<void> {
  const entry = state.selectedEntry
  if (entry === undefined) return

  if (entry.kind === "Directory") {
    await loadDirectory(state, entry.path)
    return
  }

  state.focus = "view"
}

export async function goParent(state: RangerState): Promise<void> {
  if (isSamePath(state.currentDirectory, state.root)) return

  const previousDirectory = state.currentDirectory

  await loadDirectory(state, parentPath(previousDirectory), {
    selectPath: previousDirectory,
  })
}
