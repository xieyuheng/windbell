import { Hono, type Context } from "hono"
import { cors } from "hono/cors"
import * as service from "../service/index.ts"
import type { FileSystemRouterOptions } from "./FileSystemRouterOptions.ts"
import { HttpError } from "./HttpError.ts"

type Handler = (body: unknown) => Promise<unknown>

const handlers: Record<string, Handler> = {
  exists: async (body) => service.exists(readPath(body)),
  "is-file": async (body) => service.isFile(readPath(body)),
  "is-directory": async (body) => service.isDirectory(readPath(body)),
  read: async (body) => service.read(readPath(body)),
  write: async (body) => service.write(readPath(body), readText(body)),
  list: async (body) => service.list(readPath(body)),
  "list-recursive": async (body) => service.listRecursive(readPath(body)),
  "ensure-file": async (body) => service.ensureFile(readPath(body)),
  "ensure-directory": async (body) => service.ensureDirectory(readPath(body)),
  "delete-file": async (body) => service.deleteFile(readPath(body)),
  "delete-directory": async (body) => service.deleteDirectory(readPath(body)),
  delete: async (body) => service.remove(readPath(body)),
  rename: async (body) => service.rename(readPath(body), readNewPath(body)),
}

export function createFileSystemRouter(options: FileSystemRouterOptions): Hono {
  const app = new Hono()

  if (options.corsOrigin !== undefined) {
    app.use("*", cors({ origin: options.corsOrigin }))
  }

  app.post("/:method", async (c) => {
    const method = c.req.param("method")
    const handler = handlers[method]

    if (handler === undefined) {
      throw new HttpError(404, `unknown method: ${method}`)
    }

    const body = await readJsonBody(c)
    const result = await handler(body)

    return sendJson(200, result)
  })

  app.onError((error, c) => sendError(error, c))

  return app
}

async function readJsonBody(c: Context): Promise<unknown> {
  const text = await c.req.text()
  if (text.trim() === "") return {}

  try {
    return JSON.parse(text)
  } catch {
    throw new HttpError(400, "invalid JSON body")
  }
}

function readPath(body: unknown): string {
  const record = readRecord(body)
  const path = record.path

  if (typeof path !== "string") {
    throw new HttpError(400, "field `path` must be a string")
  }

  return path
}

function readText(body: unknown): string {
  const record = readRecord(body)
  const text = record.text

  if (typeof text !== "string") {
    throw new HttpError(400, "field `text` must be a string")
  }

  return text
}

function readNewPath(body: unknown): string {
  const record = readRecord(body)
  const newPath = record.newPath

  if (typeof newPath !== "string") {
    throw new HttpError(400, "field `newPath` must be a string")
  }

  return newPath
}

function readRecord(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "request body must be a JSON object")
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

function sendError(error: unknown, _c: Context): Response {
  const httpError = error instanceof HttpError ? error : undefined
  const statusCode = httpError?.statusCode ?? statusCodeFromError(error)
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
