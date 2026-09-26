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
  exists(path: string): Promise<boolean>
  isFile(path: string): Promise<boolean>
  isDirectory(path: string): Promise<boolean>
  read(path: string): Promise<string>
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
  return {
    exists: (path) => call(config.baseUrl, "exists", { path }),
    isFile: (path) => call(config.baseUrl, "is-file", { path }),
    isDirectory: (path) => call(config.baseUrl, "is-directory", { path }),
    read: (path) => call(config.baseUrl, "read", { path }),
    write: async (path, text) => {
      await call(config.baseUrl, "write", { path, text })
    },
    list: (path) => call(config.baseUrl, "list", { path }),
    listEntries: (path) => call(config.baseUrl, "list-entries", { path }),
    listRecursive: (path) => call(config.baseUrl, "list-recursive", { path }),
    inspectFile: (path) => call(config.baseUrl, "inspect-file", { path }),
    ensureFile: async (path) => {
      await call(config.baseUrl, "ensure-file", { path })
    },
    ensureDirectory: async (path) => {
      await call(config.baseUrl, "ensure-directory", { path })
    },
    deleteFile: async (path) => {
      await call(config.baseUrl, "delete-file", { path })
    },
    deleteDirectory: async (path) => {
      await call(config.baseUrl, "delete-directory", { path })
    },
    delete: async (path) => {
      await call(config.baseUrl, "delete", { path })
    },
    rename: async (path, newPath) => {
      await call(config.baseUrl, "rename", { path, newPath })
    },
    watch: (path, onEvent, onError) =>
      watch(config.baseUrl, path, onEvent, onError),
  }
}

async function call<T>(
  baseUrl: string,
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(joinUrl(baseUrl, method), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  const value = text === "" ? null : parseJson(text)

  if (!response.ok) {
    throw new Error(
      `[FileSystemClient] ${method} failed with HTTP ${response.status}: ${readErrorMessage(value, text)}`,
    )
  }

  return value as T
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
        const response = await fetch(joinUrl(baseUrl, "watch"), {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const text = await response.text()

          throw new Error(
            `[FileSystemClient] watch failed with HTTP ${response.status}: ${readErrorMessage(
              parseJsonOrUndefined(text),
              text,
            )}`,
          )
        }

        const body = response.body
        if (body === null) {
          throw new Error("[FileSystemClient] watch response body is null")
        }

        reconnectDelay = 500
        await readEventStream(body, onEvent)
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

async function readEventStream(
  body: ReadableStream<Uint8Array>,
  onEvent: FileSystemWatchHandler,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

      let separatorIndex = buffer.indexOf("\n\n")
      while (separatorIndex !== -1) {
        const block = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)

        const event = parseEventBlock(block)
        if (event !== undefined) onEvent(event)

        separatorIndex = buffer.indexOf("\n\n")
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function parseEventBlock(block: string): FileSystemWatchEvent | undefined {
  let eventName = "message"
  const dataLines: Array<string> = []

  for (const line of block.split("\n")) {
    if (line === "" || line.startsWith(":")) continue

    const colonIndex = line.indexOf(":")
    const field = colonIndex === -1 ? line : line.slice(0, colonIndex)
    let value = colonIndex === -1 ? "" : line.slice(colonIndex + 1)

    if (value.startsWith(" ")) value = value.slice(1)

    if (field === "event") {
      eventName = value
    } else if (field === "data") {
      dataLines.push(value)
    }
  }

  if (dataLines.length === 0) return undefined

  const value = parseJsonOrUndefined(dataLines.join("\n"))
  if (value === undefined) return undefined

  switch (eventName) {
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

function joinUrl(baseUrl: string, method: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${method}`
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`[FileSystemClient] invalid JSON response: ${text}`)
  }
}

function readErrorMessage(value: unknown, fallback: string): string {
  if (value !== null && typeof value === "object" && "error" in value) {
    const error = (value as { error?: unknown }).error
    if (error !== null && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === "string") return message
    }
  }

  return fallback
}
