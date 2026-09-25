import * as S from "@xieyuheng/semiosis.js"
import { Hono, type Context } from "hono"
import { stream } from "hono/streaming"
import { HTTPException } from "hono/http-exception"
import { makeSemiosisService } from "../service/index.ts"
import type { SemiosisRouterOptions } from "./SemiosisRouterOptions.ts"

export function makeSemiosisRouter(options: SemiosisRouterOptions): Hono {
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

  app.get("/models", async () => {
    const providerNames = await options.database.providers.list()
    const models: Array<{ qualifiedName: string }> = []

    for (const providerName of providerNames) {
      const modelNames = await options.database.models.list(providerName)

      for (const modelName of modelNames) {
        models.push({
          qualifiedName: `${providerName}/${modelName}`,
        })
      }
    }

    return sendJson(200, models)
  })

  app.get("/settings", async () => {
    const settings = await options.database.settings.get()

    return sendJson(200, settings ?? { defaultModel: null })
  })

  app.put("/settings", async (c) => {
    const body = readRecord(await readJsonBody(c))
    const settings = readSettings(body)

    await options.database.settings.put(settings)
    return sendEmpty(204)
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

    const workspace = await options.database.workspaces.get(workspaceId)
    if (workspace === undefined) {
      throw new HTTPException(404, {
        message: `workspace not found: ${workspaceId}`,
      })
    }

    const session = await service.sessions.make({ workspaceId, title })
    session.context = makeDefaultInitialSigns(workspace)
    await service.sessions.put(session)

    return sendJson(201, session)
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

  app.post("/sessions/:sessionId/interpret", async (c) => {
    const sessionId = c.req.param("sessionId")
    const body = readRecord(await readJsonBody(c))
    const modelOptions = readModel(body, "model")
    const input = readSigns(body, "input")

    const session = await service.sessions.get(sessionId)
    if (session === undefined) {
      throw new HTTPException(404, { message: "session not found" })
    }

    const workspace = await options.database.workspaces.get(session.workspaceId)
    if (workspace === undefined) {
      throw new HTTPException(404, {
        message: `workspace not found: ${session.workspaceId}`,
      })
    }

    const model = await S.makeModel(modelOptions.qualifiedName, {
      database: options.database,
    })

    const toolRouter = S.makeDefaultToolRouter({
      cwd: workspace.root,
    })

    const agent = await S.makeAgentFromSession({
      database: options.database,
      sessionId: session.id,
      model,
      makeToolRouter: () => toolRouter,
    })

    c.header("Content-Type", "application/x-ndjson; charset=utf-8")
    c.header("Cache-Control", "no-store")
    c.header("X-Accel-Buffering", "no")

    return stream(c, async (stream) => {
      try {
        for await (const sign of S.agentInterpret(agent, input)) {
          await stream.writeln(
            JSON.stringify({
              type: "sign",
              sign,
            }),
          )
        }

        await stream.writeln(JSON.stringify({ type: "done" }))
      } catch (error) {
        if (stream.aborted) return

        await stream.writeln(
          JSON.stringify({
            type: "error",
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      }
    })
  })

  app.onError((error) => sendError(error))

  return app
}

function makeDefaultInitialSigns(workspace: S.Workspace): Array<S.Sign> {
  const toolRouter = S.makeDefaultToolRouter({
    cwd: workspace.root,
  })

  return [
    ...toolRouter.toolSigns,
    S.PersonaSign("You are a helpful software engineer assistant."),
  ]
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

function readWorkspace(body: unknown): S.Workspace {
  const record = readRecord(body)
  return {
    id: readString(record, "id"),
    name: readString(record, "name"),
    root: readString(record, "root"),
    createdAt: readNumber(record, "createdAt"),
    updatedAt: readNumber(record, "updatedAt"),
  }
}

function readSession(body: unknown): S.Session {
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
    context: context as Array<S.Sign>,
    createdAt: readNumber(record, "createdAt"),
    updatedAt: readNumber(record, "updatedAt"),
  }
}

function readSettings(body: Record<string, unknown>): S.Settings {
  const value = body["defaultModel"]

  if (value === null) {
    return {
      defaultModel: null,
    }
  }

  const record = readRecord(value)
  const qualifiedName = readString(record, "qualifiedName")

  return {
    defaultModel: {
      qualifiedName,
    },
  }
}

function readModel(
  body: Record<string, unknown>,
  name: string,
): { qualifiedName: string } {
  const value = body[name]
  const record = readRecord(value)

  return {
    qualifiedName: readString(record, "qualifiedName"),
  }
}

function readSigns(body: Record<string, unknown>, name: string): Array<S.Sign> {
  const value = body[name]
  if (!Array.isArray(value)) {
    throw new HTTPException(400, {
      message: `field \`${name}\` must be an array`,
    })
  }

  for (const sign of value) {
    if (sign === null || typeof sign !== "object" || Array.isArray(sign)) {
      throw new HTTPException(400, {
        message: `field \`${name}\` must contain signs`,
      })
    }
  }

  return value as Array<S.Sign>
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
