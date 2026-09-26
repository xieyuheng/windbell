import fs from "node:fs/promises"
import Path from "node:path"
import type {
  DustbinWorkspace,
  Workspace,
  WorkspaceId,
} from "../workspace/Workspace.ts"
import { assertId, isValidId } from "./id.ts"
import {
  ensureDir,
  isEnoent,
  listDirectories,
  readJsonFile,
  writeJsonFile,
} from "./jsonFile.ts"

export type DustbinWorkspaceStoreOptions = {
  workspacesRoot: string
  dustbinWorkspacesRoot: string
}

export type DustbinWorkspaceStore = {
  get(id: WorkspaceId): Promise<DustbinWorkspace | undefined>
  list(): Promise<Array<DustbinWorkspace>>
  trash(id: WorkspaceId): Promise<void>
  restore(id: WorkspaceId): Promise<void>
  remove(id: WorkspaceId): Promise<void>
}

export type DustbinWorkspaceErrorCode = "not-found" | "conflict"

export class DustbinWorkspaceError extends Error {
  code: DustbinWorkspaceErrorCode

  constructor(code: DustbinWorkspaceErrorCode, message: string) {
    super(message)
    this.name = "DustbinWorkspaceError"
    this.code = code
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch (error) {
    if (isEnoent(error)) return false
    throw error
  }
}

export function makeDustbinWorkspaceStore(
  options: DustbinWorkspaceStoreOptions,
): DustbinWorkspaceStore {
  const workspacesRoot = Path.resolve(options.workspacesRoot)
  const dustbinWorkspacesRoot = Path.resolve(options.dustbinWorkspacesRoot)

  const workspaceDir = (id: WorkspaceId): string => {
    return Path.join(workspacesRoot, id)
  }

  const dustbinWorkspaceDir = (id: WorkspaceId): string => {
    return Path.join(dustbinWorkspacesRoot, id)
  }

  const workspaceIndexPath = (id: WorkspaceId): string => {
    return Path.join(workspaceDir(id), "index.json")
  }

  const dustbinWorkspaceIndexPath = (id: WorkspaceId): string => {
    return Path.join(dustbinWorkspaceDir(id), "index.json")
  }

  const readWorkspace = async (
    id: WorkspaceId,
  ): Promise<Workspace | undefined> => {
    assertId(id)

    const value = await readJsonFile(workspaceIndexPath(id))
    if (value === undefined) return undefined

    return value as Workspace
  }

  const readDustbinWorkspace = async (
    id: WorkspaceId,
  ): Promise<DustbinWorkspace | undefined> => {
    assertId(id)

    const value = await readJsonFile(dustbinWorkspaceIndexPath(id))
    if (value === undefined) return undefined

    return value as DustbinWorkspace
  }

  return {
    get: (id) => readDustbinWorkspace(id),

    async list() {
      const ids = await listDirectories(dustbinWorkspacesRoot)
      const workspaces: Array<DustbinWorkspace> = []

      for (const id of ids) {
        if (!isValidId(id)) continue

        const workspace = await readDustbinWorkspace(id)
        if (workspace === undefined) continue
        if (typeof workspace.deletedAt !== "number") continue

        workspaces.push(workspace)
      }

      workspaces.sort((a, b) => b.deletedAt - a.deletedAt)
      return workspaces
    },

    async trash(id) {
      assertId(id)

      const workspace = await readWorkspace(id)
      if (workspace === undefined) {
        throw new DustbinWorkspaceError(
          "not-found",
          `workspace not found: ${id}`,
        )
      }

      const target = dustbinWorkspaceDir(id)
      if (await pathExists(target)) {
        throw new DustbinWorkspaceError(
          "conflict",
          `workspace already in dustbin: ${id}`,
        )
      }

      await ensureDir(dustbinWorkspacesRoot)
      await fs.rename(workspaceDir(id), target)

      const dustbinWorkspace: DustbinWorkspace = {
        ...workspace,
        deletedAt: Date.now(),
      }

      try {
        await writeJsonFile(dustbinWorkspaceIndexPath(id), dustbinWorkspace)
      } catch (error) {
        await fs.rename(target, workspaceDir(id)).catch(() => undefined)
        throw error
      }
    },

    async restore(id) {
      assertId(id)

      const workspace = await readDustbinWorkspace(id)
      if (workspace === undefined) {
        throw new DustbinWorkspaceError(
          "not-found",
          `workspace not found in dustbin: ${id}`,
        )
      }

      const target = workspaceDir(id)
      if (await pathExists(target)) {
        throw new DustbinWorkspaceError(
          "conflict",
          `workspace already exists: ${id}`,
        )
      }

      await ensureDir(workspacesRoot)
      await fs.rename(dustbinWorkspaceDir(id), target)

      const restoredWorkspace: Workspace = {
        id: workspace.id,
        name: workspace.name,
        root: workspace.root,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      }

      try {
        await writeJsonFile(workspaceIndexPath(id), restoredWorkspace)
      } catch (error) {
        await fs.rename(target, dustbinWorkspaceDir(id)).catch(() => undefined)
        throw error
      }
    },

    async remove(id) {
      assertId(id)
      await fs.rm(dustbinWorkspaceDir(id), {
        recursive: true,
        force: true,
      })
    },
  }
}
