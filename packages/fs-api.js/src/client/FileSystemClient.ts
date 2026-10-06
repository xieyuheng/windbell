import {
  makeJsonEndpoint,
  requestBytes,
  requestServerSentEvents,
  type ServerSentEvent,
} from "@windbell/http.js"
import type {
  FileSystemEntry,
  InspectFileResult,
} from "../service/fileSystem.ts"
import {
  BooleanSchema,
  FileSystemEntryListSchema,
  InspectFileResultSchema,
  StringListSchema,
  StringSchema,
  VoidSchema,
} from "./schemas.ts"

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

export type WriteFileOptions = {
  path: string
  text: string
}

export type RenameFileOptions = {
  path: string
  newPath: string
}

export type FileSystemClient = {
  home(): Promise<string>
  exists(path: string): Promise<boolean>
  isFile(path: string): Promise<boolean>
  isDirectory(path: string): Promise<boolean>
  read(path: string): Promise<string>
  readBytes(path: string): Promise<Uint8Array>
  write(options: WriteFileOptions): Promise<void>
  list(path: string): Promise<Array<string>>
  listEntries(path: string): Promise<Array<FileSystemEntry>>
  listRecursive(path: string): Promise<Array<string>>
  inspectFile(path: string): Promise<InspectFileResult>
  ensureFile(path: string): Promise<void>
  ensureDirectory(path: string): Promise<void>
  deleteFile(path: string): Promise<void>
  deleteDirectory(path: string): Promise<void>
  delete(path: string): Promise<void>
  rename(options: RenameFileOptions): Promise<void>
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
  return {
    home: makeJsonEndpoint(config, {
      method: "POST",
      path: "/home",
      body: () => ({}),
      output: StringSchema,
    }),

    exists: makeJsonEndpoint(config, {
      method: "POST",
      path: "/exists",
      body: (path: string) => ({ path }),
      output: BooleanSchema,
    }),

    isFile: makeJsonEndpoint(config, {
      method: "POST",
      path: "/is-file",
      body: (path: string) => ({ path }),
      output: BooleanSchema,
    }),

    isDirectory: makeJsonEndpoint(config, {
      method: "POST",
      path: "/is-directory",
      body: (path: string) => ({ path }),
      output: BooleanSchema,
    }),

    read: makeJsonEndpoint(config, {
      method: "POST",
      path: "/read",
      body: (path: string) => ({ path }),
      output: StringSchema,
    }),

    readBytes: (path) =>
      requestBytes({
        baseUrl: config.baseUrl,
        method: "POST",
        path: "/read-bytes",
        body: { path },
      }),

    write: makeJsonEndpoint(config, {
      method: "POST",
      path: "/write",
      body: (options: WriteFileOptions) => options,
      output: VoidSchema,
    }),

    list: makeJsonEndpoint(config, {
      method: "POST",
      path: "/list",
      body: (path: string) => ({ path }),
      output: StringListSchema,
    }),

    listEntries: makeJsonEndpoint(config, {
      method: "POST",
      path: "/list-entries",
      body: (path: string) => ({ path }),
      output: FileSystemEntryListSchema,
    }),

    listRecursive: makeJsonEndpoint(config, {
      method: "POST",
      path: "/list-recursive",
      body: (path: string) => ({ path }),
      output: StringListSchema,
    }),

    inspectFile: makeJsonEndpoint(config, {
      method: "POST",
      path: "/inspect-file",
      body: (path: string) => ({ path }),
      output: InspectFileResultSchema,
    }),

    ensureFile: makeJsonEndpoint(config, {
      method: "POST",
      path: "/ensure-file",
      body: (path: string) => ({ path }),
      output: VoidSchema,
    }),

    ensureDirectory: makeJsonEndpoint(config, {
      method: "POST",
      path: "/ensure-directory",
      body: (path: string) => ({ path }),
      output: VoidSchema,
    }),

    deleteFile: makeJsonEndpoint(config, {
      method: "POST",
      path: "/delete-file",
      body: (path: string) => ({ path }),
      output: VoidSchema,
    }),

    deleteDirectory: makeJsonEndpoint(config, {
      method: "POST",
      path: "/delete-directory",
      body: (path: string) => ({ path }),
      output: VoidSchema,
    }),

    delete: makeJsonEndpoint(config, {
      method: "POST",
      path: "/delete",
      body: (path: string) => ({ path }),
      output: VoidSchema,
    }),

    rename: makeJsonEndpoint(config, {
      method: "POST",
      path: "/rename",
      body: (options: RenameFileOptions) => options,
      output: VoidSchema,
    }),

    watch: (path, onEvent, onError) =>
      watch(config.baseUrl, path, onEvent, onError),
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
