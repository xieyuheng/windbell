import fs from "node:fs/promises"
import Path from "node:path"
import type {
  DustbinSessionIndex,
  SessionId,
  SessionIndex,
} from "../session/Session.ts"
import type { WorkspaceId } from "../workspace/Workspace.ts"
import { assertId, isValidId } from "./id.ts"
import {
  ensureDir,
  isEnoent,
  listDirectories,
  readJsonFile,
  writeJsonFile,
} from "./jsonFile.ts"

export type DustbinSessionStoreOptions = {
  sessionsRoot: string
  dustbinSessionsRoot: string
}

export type ListDustbinSessionOptions = {
  workspaceId: WorkspaceId | undefined
}

export type DustbinSessionStore = {
  move(sessionId: SessionId): Promise<void>
  list(options: ListDustbinSessionOptions): Promise<Array<DustbinSessionIndex>>
  restore(sessionId: SessionId): Promise<void>
  remove(sessionId: SessionId): Promise<void>
}

export type DustbinSessionErrorCode = "not-found" | "conflict"

export class DustbinSessionError extends Error {
  code: DustbinSessionErrorCode

  constructor(code: DustbinSessionErrorCode, message: string) {
    super(message)
    this.name = "DustbinSessionError"
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

export function makeDustbinSessionStore(
  options: DustbinSessionStoreOptions,
): DustbinSessionStore {
  const sessionsRoot = Path.resolve(options.sessionsRoot)
  const dustbinSessionsRoot = Path.resolve(options.dustbinSessionsRoot)

  const sessionDir = (id: SessionId): string => {
    return Path.join(sessionsRoot, id)
  }

  const dustbinSessionDir = (id: SessionId): string => {
    return Path.join(dustbinSessionsRoot, id)
  }

  const sessionIndexPath = (id: SessionId): string => {
    return Path.join(sessionDir(id), "index.json")
  }

  const dustbinSessionIndexPath = (id: SessionId): string => {
    return Path.join(dustbinSessionDir(id), "index.json")
  }

  const readSessionIndex = async (
    id: SessionId,
  ): Promise<SessionIndex | undefined> => {
    assertId(id)

    const value = await readJsonFile(sessionIndexPath(id))
    if (value === undefined) return undefined

    return value as SessionIndex
  }

  const readDustbinSessionIndex = async (
    id: SessionId,
  ): Promise<DustbinSessionIndex | undefined> => {
    assertId(id)

    const value = await readJsonFile(dustbinSessionIndexPath(id))
    if (value === undefined) return undefined

    return value as DustbinSessionIndex
  }

  return {
    async move(sessionId) {
      assertId(sessionId)

      const index = await readSessionIndex(sessionId)
      if (index === undefined) {
        throw new DustbinSessionError(
          "not-found",
          `session not found: ${sessionId}`,
        )
      }

      const target = dustbinSessionDir(sessionId)
      if (await pathExists(target)) {
        throw new DustbinSessionError(
          "conflict",
          `session already in dustbin: ${sessionId}`,
        )
      }

      await ensureDir(dustbinSessionsRoot)
      await fs.rename(sessionDir(sessionId), target)

      const dustbinIndex: DustbinSessionIndex = {
        ...index,
        deletedAt: Date.now(),
      }

      try {
        await writeJsonFile(dustbinSessionIndexPath(sessionId), dustbinIndex)
      } catch (error) {
        await fs.rename(target, sessionDir(sessionId)).catch(() => undefined)
        throw error
      }
    },

    async list(options) {
      const ids = await listDirectories(dustbinSessionsRoot)
      const indexes: Array<DustbinSessionIndex> = []

      for (const id of ids) {
        if (!isValidId(id)) continue

        const index = await readDustbinSessionIndex(id)
        if (index === undefined) continue

        if (typeof index.deletedAt !== "number") continue

        if (
          options.workspaceId !== undefined &&
          index.workspaceId !== options.workspaceId
        ) {
          continue
        }

        indexes.push(index)
      }

      indexes.sort((a, b) => b.deletedAt - a.deletedAt)
      return indexes
    },

    async restore(sessionId) {
      assertId(sessionId)

      const index = await readDustbinSessionIndex(sessionId)
      if (index === undefined) {
        throw new DustbinSessionError(
          "not-found",
          `session not found in dustbin: ${sessionId}`,
        )
      }

      const target = sessionDir(sessionId)
      if (await pathExists(target)) {
        throw new DustbinSessionError(
          "conflict",
          `session already exists: ${sessionId}`,
        )
      }

      await ensureDir(sessionsRoot)
      await fs.rename(dustbinSessionDir(sessionId), target)

      const restoredIndex: SessionIndex = {
        id: index.id,
        workspaceId: index.workspaceId,
        title: index.title,
        createdAt: index.createdAt,
        updatedAt: index.updatedAt,
      }

      try {
        await writeJsonFile(sessionIndexPath(sessionId), restoredIndex)
      } catch (error) {
        await fs
          .rename(target, dustbinSessionDir(sessionId))
          .catch(() => undefined)
        throw error
      }
    },

    async remove(sessionId) {
      assertId(sessionId)
      await fs.rm(dustbinSessionDir(sessionId), {
        recursive: true,
        force: true,
      })
    },
  }
}
