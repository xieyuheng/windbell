import {
  requestBytes,
  requestJson,
  requestServerSentEvents,
  type ServerSentEvent,
} from "@xieyuheng/http.js"
import type {
  FileSystemEntry,
  InspectFileResult,
} from "../service/fileSystem.ts"

export type FileSystemWatchEvent =
  | { type: "ready"; path: string }
  | {
      type: "change"
      path: string
      eventType: "rename" | "change"
      filename: string | null
    }
  | { type: "ping" }
  | { type: "watch-error"; message: string }

export type FileSystemWatchHandler = (event: FileSystemWatchEvent) => void

export type FileSystemWatchErrorHandler = (error: Error) => void

export type FileSystemClient = {
  home(): Promise<string>
  exists(path: string): Promise<boolean>
  isFile(path: string): Promise<boolean>
  isDirectory(path: string): Promise<boolean>
  read(path: string): Promise<string>
  readBytes(path: string): Promise<Uint8Array>
  write(path: string, text: string): Promise<void>
  list(path: string): Promise<Array<string>>
  listEntries(path: string): Promise<Array<FileSystemEntry>>
  listRecursive(path: string): Promise<Array<string>>
  inspectFile(path: string): Promise<InspectFileResult>
  ensureFile(path: string): Promise<void>
  ensureDirectory(path: string): Promise<void>
  deleteFile(path: string): Promise<void>
  deleteDirectory(path: string): Promise<void>
  delete(path: string): Promise<void>
  rename(path: string, newPath: string): Promise<void>
  watch(
    path: string,
    onEvent: FileSystemWatchHandler,
    onError?: FileSystemWatchErrorHandler,
  ): () => void
}

export type FileSystemClientConfig = {
  baseUrl: string
}

export function makeFileSystemClient(
  config: FileSystemClientConfig,
): FileSystemClient {
  const baseUrl = config.baseUrl

  return {
    home: () =>
      requestJson<string>({
        baseUrl,
        method: "POST",
        path: "/home",
        body: {},
      }),

    exists: (path) =>
      requestJson<boolean>({
        baseUrl,
        method: "POST",
        path: "/exists",
        body: { path },
      }),

    isFile: (path) =>
      requestJson<boolean>({
        baseUrl,
        method: "POST",
        path: "/is-file",
        body: { path },
      }),

    isDirectory: (path) =>
      requestJson<boolean>({
        baseUrl,
        method: "POST",
        path: "/is-directory",
        body: { path },
      }),

    read: (path) =>
      requestJson<string>({
        baseUrl,
        method: "POST",
        path: "/read",
        body: { path },
      }),

    readBytes: (path) =>
      requestBytes({
        baseUrl,
        method: "POST",
        path: "/read-bytes",
        body: { path },
      }),

    write: async (path, text) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/write",
        body: { path, text },
      })
    },

    list: (path) =>
      requestJson<Array<string>>({
        baseUrl,
        method: "POST",
        path: "/list",
        body: { path },
      }),

    listEntries: (path) =>
      requestJson<Array<FileSystemEntry>>({
        baseUrl,
        method: "POST",
        path: "/list-entries",
        body: { path },
      }),

    listRecursive: (path) =>
      requestJson<Array<string>>({
        baseUrl,
        method: "POST",
        path: "/list-recursive",
        body: { path },
      }),

    inspectFile: (path) =>
      requestJson<InspectFileResult>({
        baseUrl,
        method: "POST",
        path: "/inspect-file",
        body: { path },
      }),

    ensureFile: async (path) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/ensure-file",
        body: { path },
      })
    },

    ensureDirectory: async (path) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/ensure-directory",
        body: { path },
      })
    },

    deleteFile: async (path) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/delete-file",
        body: { path },
      })
    },

    deleteDirectory: async (path) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/delete-directory",
        body: { path },
      })
    },

    delete: async (path) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/delete",
        body: { path },
      })
    },

    rename: async (path, newPath) => {
      await requestJson({
        baseUrl,
        method: "POST",
        path: "/rename",
        body: { path, newPath },
      })
    },

    watch: (path, onEvent, onError) => watch(baseUrl, path, onEvent, onError),
  }
}

function watch(
  baseUrl: string,
  path: string,
  onEvent: FileSystemWatchHandler,
  onError?: FileSystemWatchErrorHandler,
): () => void {
  let stopped = false
  let controller: AbortController | undefined
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let sleepResolve: (() => void) | undefined
  let reconnectDelay = 500

  function sleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => {
      sleepResolve = resolve
      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined
        sleepResolve = undefined
        resolve()
      }, delayMs)
    })
  }

  function stop(): void {
    if (stopped) return

    stopped = true
    controller?.abort()

    if (reconnectTimer !== undefined) {
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
    }

    sleepResolve?.()
    sleepResolve = undefined
  }

  void (async () => {
    while (!stopped) {
      controller = new AbortController()

      try {
        let connected = false

        for await (const event of requestServerSentEvents({
          baseUrl,
          method: "POST",
          path: "/watch",
          body: { path },
          signal: controller.signal,
        })) {
          if (!connected) {
            connected = true
            reconnectDelay = 500
          }

          const watchEvent = parseFileSystemWatchEvent(event)
          if (watchEvent !== undefined) onEvent(watchEvent)
        }
      } catch (error) {
        if (stopped) return

        onError?.(toError(error))
      }

      if (stopped) return

      await sleep(reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, 5_000)
    }
  })()

  return stop
}

function parseFileSystemWatchEvent(
  event: ServerSentEvent,
): FileSystemWatchEvent | undefined {
  const value = parseJsonOrUndefined(event.data)
  if (value === undefined) return undefined

  switch (event.event) {
    case "ready": {
      const path = readStringField(value, "path")
      return path === undefined ? undefined : { type: "ready", path }
    }

    case "change": {
      const path = readStringField(value, "path")
      const eventType = readStringField(value, "eventType")
      const filename = readFilenameField(value)

      if (
        path === undefined ||
        (eventType !== "rename" && eventType !== "change") ||
        filename === undefined
      ) {
        return undefined
      }

      return { type: "change", path, eventType, filename }
    }

    case "ping":
      return { type: "ping" }

    case "watch-error": {
      const message = readStringField(value, "message")
      return message === undefined
        ? undefined
        : { type: "watch-error", message }
    }

    default:
      return undefined
  }
}

function readStringField(value: unknown, key: string): string | undefined {
  if (value === null || typeof value !== "object" || !(key in value)) {
    return undefined
  }

  const field = (value as Record<string, unknown>)[key]
  return typeof field === "string" ? field : undefined
}

function readFilenameField(value: unknown): string | null | undefined {
  if (value === null || typeof value !== "object") return undefined

  const filename = (value as Record<string, unknown>).filename
  if (filename === null || typeof filename === "string") return filename

  return undefined
}

function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
