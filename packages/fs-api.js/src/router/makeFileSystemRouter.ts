import { watch } from "node:fs"
import Path from "node:path"
import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { streamSSE } from "hono/streaming"
import * as service from "../service/index.ts"

type Handler = (body: unknown) => Promise<unknown>

const handlers: Record<string, Handler> = {
  exists: async (body) => service.exists(readPath(body)),
  "is-file": async (body) => service.isFile(readPath(body)),
  "is-directory": async (body) => service.isDirectory(readPath(body)),
  read: async (body) => service.read(readPath(body)),
  write: async (body) => service.write(readPath(body), readText(body)),
  list: async (body) => service.list(readPath(body)),
  "list-entries": async (body) => service.listEntries(readPath(body)),
  "inspect-file": async (body) => service.inspectFile(readPath(body)),
  "list-recursive": async (body) => service.listRecursive(readPath(body)),
  "ensure-file": async (body) => service.ensureFile(readPath(body)),
  "ensure-directory": async (body) => service.ensureDirectory(readPath(body)),
  "delete-file": async (body) => service.deleteFile(readPath(body)),
  "delete-directory": async (body) => service.deleteDirectory(readPath(body)),
  delete: async (body) => service.remove(readPath(body)),
  rename: async (body) => service.rename(readPath(body), readNewPath(body)),
}

export function makeFileSystemRouter(): Hono {
  const app = new Hono()

  app.get("/health", async (c) => {
    return c.json(await service.health())
  })

  app.post("/watch", async (c) => {
    const body = await readJsonBody(c)
    const path = readPath(body)

    if (!(await service.exists(path))) {
      throw new HTTPException(404, {
        message: `path not found: ${path}`,
      })
    }

    if (!(await service.isDirectory(path))) {
      throw new HTTPException(400, {
        message: `path is not a directory: ${path}`,
      })
    }

    return streamSSE(c, async (stream) => {
      let watcher: ReturnType<typeof watch> | undefined
      let heartbeat: ReturnType<typeof setInterval> | undefined
      let cleanedUp = false

      function cleanup(): void {
        if (cleanedUp) return

        cleanedUp = true

        if (heartbeat !== undefined) {
          clearInterval(heartbeat)
        }

        watcher?.close()
      }

      try {
        watcher = watch(path, { recursive: true }, (eventType, filename) => {
          const name = filename === null ? null : filename.toString()
          const changedPath = name === null ? path : Path.join(path, name)

          void stream.writeSSE({
            event: "change",
            data: JSON.stringify({
              path: changedPath,
              eventType,
              filename: name,
            }),
          })
        })
      } catch (error) {
        await stream.writeSSE({
          event: "watch-error",
          data: JSON.stringify({
            message: error instanceof Error ? error.message : String(error),
          }),
        })
        return
      }

      if (watcher === undefined) return

      watcher.on("error", (error) => {
        void stream
          .writeSSE({
            event: "watch-error",
            data: JSON.stringify({
              message: error instanceof Error ? error.message : String(error),
            }),
          })
          .finally(() => {
            cleanup()
            stream.abort()
          })
      })

      const closed = new Promise<void>((resolve) => {
        stream.onAbort(() => {
          cleanup()
          resolve()
        })
      })

      await stream.writeSSE({
        event: "ready",
        data: JSON.stringify({ path }),
      })

      heartbeat = setInterval(() => {
        if (stream.aborted) return

        void stream.writeSSE({
          event: "ping",
          data: "{}",
        })
      }, 15_000)

      await closed
    })
  })

  app.post("/:method", async (c) => {
    const method = c.req.param("method")
    const handler = handlers[method]

    if (handler === undefined) {
      throw new HTTPException(404, { message: `unknown method: ${method}` })
    }

    const body = await readJsonBody(c)
    const result = await handler(body)

    return sendJson(200, result)
  })

  app.onError((error) => sendError(error))

  return app
}

async function readJsonBody(c: Context): Promise<unknown> {
  const text = await c.req.text()
  if (text.trim() === "") return {}

  try {
    return JSON.parse(text)
  } catch {
    throw new HTTPException(400, { message: "invalid JSON body" })
  }
}

function readPath(body: unknown): string {
  const record = readRecord(body)
  const path = record.path

  if (typeof path !== "string") {
    throw new HTTPException(400, { message: "field `path` must be a string" })
  }

  return path
}

function readText(body: unknown): string {
  const record = readRecord(body)
  const text = record.text

  if (typeof text !== "string") {
    throw new HTTPException(400, { message: "field `text` must be a string" })
  }

  return text
}

function readNewPath(body: unknown): string {
  const record = readRecord(body)
  const newPath = record.newPath

  if (typeof newPath !== "string") {
    throw new HTTPException(400, {
      message: "field `newPath` must be a string",
    })
  }

  return newPath
}

function readRecord(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new HTTPException(400, {
      message: "request body must be a JSON object",
    })
  }

  return body as Record<string, unknown>
}

function sendJson(statusCode: number, value: unknown): Response {
  return new Response(JSON.stringify(value ?? null), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}

function sendError(error: unknown): Response {
  const statusCode =
    error instanceof HTTPException ? error.status : statusCodeFromError(error)
  const message = error instanceof Error ? error.message : String(error)

  return sendJson(statusCode, {
    error: {
      message,
    },
  })
}

function statusCodeFromError(error: unknown): number {
  const code = readErrorCode(error)

  switch (code) {
    case "ENOENT":
      return 404
    case "EACCES":
    case "EPERM":
      return 403
    case "EISDIR":
    case "ENOTDIR":
      return 400
    case "EEXIST":
    case "ENOTEMPTY":
      return 409
    case "ENOSPC":
      return 507
    default:
      return 500
  }
}

function readErrorCode(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined
  return (error as NodeJS.ErrnoException).code
}
