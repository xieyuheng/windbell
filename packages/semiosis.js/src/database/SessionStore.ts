import fs from "node:fs/promises"
import Path from "node:path"
import type { Session, SessionId, SessionIndex } from "../session/Session.ts"
import type { Sign } from "../sign/index.ts"
import type { WorkspaceId } from "../workspace/Workspace.ts"
import { assertId, isValidId, makeId } from "./id.ts"
import {
  ensureDir,
  listDirectories,
  listFiles,
  readJsonFile,
  readTextFile,
  writeJsonFile,
  writeTextFile,
} from "./jsonFile.ts"
import {
  formatSignFileName,
  parseSign,
  parseSignFileName,
  serializeSign,
} from "./signFile.ts"

export type SessionStoreOptions = {
  root: string
}

export type MakeSessionOptions = {
  workspaceId: WorkspaceId
  title: string
}

export type ListSessionOptions = {
  workspaceId: WorkspaceId | undefined
}

export type SessionStore = {
  make(options: MakeSessionOptions): Promise<Session>
  get(id: SessionId): Promise<Session | undefined>
  list(options: ListSessionOptions): Promise<Array<SessionIndex>>
  put(session: Session): Promise<void>
  appendSign(id: SessionId, sign: Sign): Promise<void>
  remove(id: SessionId): Promise<void>
}

export function makeSessionStore(options: SessionStoreOptions): SessionStore {
  const root = Path.resolve(options.root)

  const sessionDir = (id: SessionId): string => {
    return Path.join(root, id)
  }

  const contextDir = (id: SessionId): string => {
    return Path.join(sessionDir(id), "context")
  }

  const indexPath = (id: SessionId): string => {
    return Path.join(sessionDir(id), "index.json")
  }

  const readIndex = async (
    id: SessionId,
  ): Promise<SessionIndex | undefined> => {
    assertId(id)

    const value = await readJsonFile(indexPath(id))
    if (value === undefined) return undefined

    return value as SessionIndex
  }

  const readContext = async (id: SessionId): Promise<Array<Sign>> => {
    const directory = contextDir(id)
    const fileNames = await listFiles(directory)
    const entries: Array<{ sequence: number; sign: Sign }> = []

    for (const fileName of fileNames) {
      const info = parseSignFileName(fileName)
      if (info === undefined) continue

      const text = await readTextFile(Path.join(directory, fileName))
      if (text === undefined) continue

      entries.push({
        sequence: info.sequence,
        sign: parseSign(fileName, text),
      })
    }

    entries.sort((a, b) => a.sequence - b.sequence)
    return entries.map((entry) => entry.sign)
  }

  const nextSignSequence = async (id: SessionId): Promise<number> => {
    const fileNames = await listFiles(contextDir(id))
    let maxSequence = -1

    for (const fileName of fileNames) {
      const info = parseSignFileName(fileName)
      if (info !== undefined && info.sequence > maxSequence) {
        maxSequence = info.sequence
      }
    }

    return maxSequence + 1
  }

  const store: SessionStore = {
    async make(options) {
      const now = Date.now()
      const session: Session = {
        id: makeId("session"),
        workspaceId: options.workspaceId,
        title: options.title,
        context: [],
        createdAt: now,
        updatedAt: now,
      }

      await store.put(session)
      return session
    },

    async get(id) {
      const index = await readIndex(id)
      if (index === undefined) return undefined

      const context = await readContext(id)

      return {
        id: index.id,
        workspaceId: index.workspaceId,
        title: index.title,
        context,
        createdAt: index.createdAt,
        updatedAt: index.updatedAt,
      }
    },

    async list(options) {
      const ids = await listDirectories(root)
      const indexes: Array<SessionIndex> = []

      for (const id of ids) {
        if (!isValidId(id)) continue

        const index = await readIndex(id)
        if (index === undefined) continue

        if (
          options.workspaceId !== undefined &&
          index.workspaceId !== options.workspaceId
        ) {
          continue
        }

        indexes.push(index)
      }

      indexes.sort((a, b) => a.createdAt - b.createdAt)
      return indexes
    },

    async put(session) {
      assertId(session.id)

      await fs.rm(contextDir(session.id), { recursive: true, force: true })
      await ensureDir(contextDir(session.id))

      const index: SessionIndex = {
        id: session.id,
        workspaceId: session.workspaceId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }

      await writeJsonFile(indexPath(session.id), index)

      for (const [sequence, sign] of session.context.entries()) {
        const fileName = formatSignFileName(sequence, sign)
        await writeTextFile(
          Path.join(contextDir(session.id), fileName),
          serializeSign(sign),
        )
      }
    },

    async appendSign(id, sign) {
      const index = await readIndex(id)
      if (index === undefined) {
        throw new Error(`[SessionStore] session not found: ${id}`)
      }

      const sequence = await nextSignSequence(id)
      const fileName = formatSignFileName(sequence, sign)

      await writeTextFile(
        Path.join(contextDir(id), fileName),
        serializeSign(sign),
      )

      const updatedIndex: SessionIndex = {
        ...index,
        updatedAt: Date.now(),
      }

      await writeJsonFile(indexPath(id), updatedIndex)
    },

    async remove(id) {
      assertId(id)
      await fs.rm(sessionDir(id), { recursive: true, force: true })
    },
  }

  return store
}
