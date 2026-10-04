import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { makeThemeStore } from "../theme/ThemeStore.ts"
import type { Theme, ThemeColors, ThemeInput } from "../theme/Theme.ts"

export type ThemesRouterOptions = {
  root: string
}

export function makeThemesRouter(options: ThemesRouterOptions): Hono {
  const app = new Hono()
  const store = makeThemeStore({ root: options.root })

  app.get("/", async () => {
    return sendJson(200, await store.list())
  })

  app.get("/:themeId", async (c) => {
    const theme = await store.get(c.req.param("themeId"))
    if (theme === undefined) {
      throw new HTTPException(404, { message: "theme not found" })
    }

    return sendJson(200, theme)
  })

  app.post("/", async (c) => {
    const input = readThemeInput(await readJsonBody(c))
    return sendJson(201, await store.create(input))
  })

  app.put("/:themeId", async (c) => {
    const themeId = c.req.param("themeId")
    const input = readThemeInput(await readJsonBody(c))
    const current = await store.get(themeId)

    if (current === undefined) {
      throw new HTTPException(404, { message: "theme not found" })
    }

    const theme: Theme = {
      id: themeId,
      name: input.name,
      colors: input.colors,
      createdAt: current.createdAt,
      updatedAt: Date.now(),
    }

    await store.put(theme)
    return sendJson(200, theme)
  })

  app.delete("/:themeId", async (c) => {
    const themeId = c.req.param("themeId")
    const current = await store.get(themeId)

    if (current === undefined) {
      throw new HTTPException(404, { message: "theme not found" })
    }

    await store.remove(themeId)
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

function readThemeInput(body: unknown): ThemeInput {
  const record = readRecord(body)
  const name = record.name
  const colors = record.colors

  if (typeof name !== "string" || name.trim() === "") {
    throw new HTTPException(400, { message: "field `name` must be a string" })
  }

  return {
    name: name.trim(),
    colors: readThemeColors(colors),
  }
}

function readThemeColors(value: unknown): ThemeColors {
  const record = readRecord(value)
  return {
    light: readColorRecord(record.light, "colors.light"),
    dark: readColorRecord(record.dark, "colors.dark"),
  }
}

function readColorRecord(value: unknown, name: string): Record<string, string> {
  const record = readRecord(value)
  const colors: Record<string, string> = {}

  for (const [key, item] of Object.entries(record)) {
    if (typeof item !== "string" || item.trim() === "") {
      throw new HTTPException(400, {
        message: `field \`${name}.${key}\` must be a non-empty string`,
      })
    }

    colors[key] = item.trim()
  }

  return colors
}

function readRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || value instanceof Array) {
    throw new HTTPException(400, { message: "expected a JSON object" })
  }

  return value as Record<string, unknown>
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
  const statusCode = error instanceof HTTPException ? error.status : 500
  const message = error instanceof Error ? error.message : String(error)

  return sendJson(statusCode, {
    error: {
      message,
    },
  })
}
