import type { Session, Sign, Workspace } from "@xieyuheng/semiosis.js"
import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { makeSemiosisService } from "../service/index.ts"
import type { SemiosisRouterOptions } from "./SemiosisRouterOptions.ts"

export function createSemiosisRouter(options: SemiosisRouterOptions): Hono {
  const app = new Hono()
  const service = makeSemiosisService({
    database: options.database,
  })

  app.get("/health", async () => {
    return sendJson(200, {
      ok: true,
      service: "semiosis-api",
    })
  })

  app.get("/workspaces", async () => {
    return sendJson(200, await service.workspaces.list())
  })

  app.post("/workspaces/ensure", async (c) => {
    const body = readRecord(await readJsonBody(c))
    const name = readString(body, "name")
    const root = readString(body, "root")

    return sendJson(200, await service.workspaces.ensure({ name, root }))
  })

  app.get("/workspaces/:workspaceId", async (c) => {
    const workspace = await service.workspaces.get(c.req.param("workspaceId"))

    if (workspace === undefined) {
      throw new HTTPException(404, { message: "workspace not found" })
    }

    return sendJson(200, workspace)
  })

  app.put("/workspaces/:workspaceId", async (c) => {
    const workspace = readWorkspace(await readJsonBody(c))
    const workspaceId = c.req.param("workspaceId")

    if (workspace.id !== workspaceId) {
      throw new HTTPException(400, { message: "workspace id mismatch" })
    }

    await service.workspaces.put(workspace)
    return sendEmpty(204)
  })

  app.delete("/workspaces/:workspaceId", async (c) => {
    await service.workspaces.remove(c.req.param("workspaceId"))
    return sendEmpty(204)
  })

  app.get("/sessions", async (c) => {
    const workspaceId = c.req.query("workspaceId")

    return sendJson(200, await service.sessions.list({ workspaceId }))
  })

  app.post("/sessions", async (c) => {
    const body = readRecord(await readJsonBody(c))
    const workspaceId = readString(body, "workspaceId")
    const title = readString(body, "title")

    return sendJson(201, await service.sessions.make({ workspaceId, title }))
  })

  app.get("/sessions/:sessionId", async (c) => {
    const session = await service.sessions.get(c.req.param("sessionId"))

    if (session === undefined) {
      throw new HTTPException(404, { message: "session not found" })
    }

    return sendJson(200, session)
  })

  app.put("/sessions/:sessionId", async (c) => {
    const session = readSession(await readJsonBody(c))
    const sessionId = c.req.param("sessionId")

    if (session.id !== sessionId) {
      throw new HTTPException(400, { message: "session id mismatch" })
    }

    await service.sessions.put(session)
    return sendEmpty(204)
  })

  app.delete("/sessions/:sessionId", async (c) => {
    await service.sessions.remove(c.req.param("sessionId"))
    return sendEmpty(204)
  })

  app.post("/sessions/:sessionId/signs", async (c) => {
    const body = readRecord(await readJsonBody(c))
    const sign = readSign(body, "sign")

    await service.sessions.appendSign(c.req.param("sessionId"), sign)
    return sendEmpty(204)
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

function readRecord(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new HTTPException(400, {
      message: "request body must be a JSON object",
    })
  }

  return body as Record<string, unknown>
}

function readString(body: Record<string, unknown>, name: string): string {
  const value = body[name]
  if (typeof value !== "string") {
    throw new HTTPException(400, {
      message: `field \`${name}\` must be a string`,
    })
  }

  return value
}

function readNumber(body: Record<string, unknown>, name: string): number {
  const value = body[name]
  if (typeof value !== "number") {
    throw new HTTPException(400, {
      message: `field \`${name}\` must be a number`,
    })
  }

  return value
}

function readWorkspace(body: unknown): Workspace {
  const record = readRecord(body)
  return {
    id: readString(record, "id"),
    name: readString(record, "name"),
    root: readString(record, "root"),
    createdAt: readNumber(record, "createdAt"),
    updatedAt: readNumber(record, "updatedAt"),
  }
}

function readSession(body: unknown): Session {
  const record = readRecord(body)
  const context = record.context
  if (!Array.isArray(context)) {
    throw new HTTPException(400, {
      message: "field `context` must be an array",
    })
  }

  return {
    id: readString(record, "id"),
    workspaceId: readString(record, "workspaceId"),
    title: readString(record, "title"),
    context: context as Array<Sign>,
    createdAt: readNumber(record, "createdAt"),
    updatedAt: readNumber(record, "updatedAt"),
  }
}

function readSign(body: Record<string, unknown>, name: string): Sign {
  const value = body[name]
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HTTPException(400, {
      message: `field \`${name}\` must be an object`,
    })
  }

  return value as Sign
}

function sendJson(statusCode: number, value: unknown): Response {
  return new Response(JSON.stringify(value ?? null), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}

function sendEmpty(statusCode: number): Response {
  return new Response(null, { status: statusCode })
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
