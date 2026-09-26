import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"
import { isSamePath, parentPath } from "./RangerPath"
import {
  readStoredRangerLocation,
  writeStoredRangerLocation,
} from "./RangerPersistence"

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

function persistLocation(state: RangerState): void {
  writeStoredRangerLocation(state.workspaceId, {
    currentDirectory: state.currentDirectory,
    selectedPath: state.selectedEntry?.path ?? null,
  })
}

export async function loadRanger(state: RangerState): Promise<void> {
  state.loading = true
  state.error = undefined
  state.workspace = undefined
  state.root = ""
  state.currentDirectory = ""
  state.entries = []
  state.selectedIndex = -1
  state.selectedEntry = undefined

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

    const storedLocation = readStoredRangerLocation(state.workspaceId)

    if (storedLocation !== undefined) {
      const restored = await loadDirectory(
        state,
        storedLocation.currentDirectory,
        {
          selectPath: storedLocation.selectedPath ?? undefined,
        },
      )

      if (restored) return
    }

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
): Promise<boolean> {
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

    persistLocation(state)
    return true
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    return false
  } finally {
    state.loading = false
  }
}

export async function refreshRanger(state: RangerState): Promise<void> {
  if (state.currentDirectory === "") return

  const directory = state.currentDirectory

  try {
    const entries = await fileSystem.listEntries(directory)

    if (state.loading || directory !== state.currentDirectory) return

    const selectedPath = state.selectedEntry?.path
    const selectedIndex =
      selectedPath === undefined
        ? -1
        : entries.findIndex((entry) => entry.path === selectedPath)
    const index = selectedIndex === -1 ? 0 : selectedIndex

    state.entries = entries
    state.selectedIndex = entries.length > 0 ? index : -1
    state.selectedEntry = entries[index]
    state.error = undefined

    persistLocation(state)
  } catch (error) {
    if (state.loading || directory !== state.currentDirectory) return

    if (!isSamePath(directory, state.root)) {
      await loadDirectory(state, state.root)
      return
    }

    state.error = error instanceof Error ? error.message : String(error)
  }
}

export function watchRanger(
  state: RangerState,
  onError?: (error: Error) => void,
): () => void {
  if (state.root === "") return () => {}

  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  const stop = fileSystem.watch(
    state.root,
    (event) => {
      if (event.type === "watch-error") {
        onError?.(new Error(event.message))
        return
      }

      if (event.type === "ready") {
        state.error = undefined
        return
      }

      if (event.type !== "change") return

      if (refreshTimer !== undefined) {
        clearTimeout(refreshTimer)
      }

      refreshTimer = setTimeout(() => {
        refreshTimer = undefined

        if (!state.loading) {
          void refreshRanger(state)
        }
      }, 150)
    },
    onError,
  )

  return () => {
    if (refreshTimer !== undefined) {
      clearTimeout(refreshTimer)
      refreshTimer = undefined
    }

    stop()
  }
}

export function selectEntry(state: RangerState, index: number): void {
  if (index < 0 || index >= state.entries.length) return

  state.selectedIndex = index
  state.selectedEntry = state.entries[index]

  persistLocation(state)
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
