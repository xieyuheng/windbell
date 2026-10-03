import type { ServerType } from "@hono/node-server"
import { Hono } from "hono"
import { makeSemiosisRouter } from "../router/index.ts"
import type { SemiosisServerOptions } from "./SemiosisServerOptions.ts"
import { serveAndWait } from "./serveAndWait.ts"

function makeApp(options: SemiosisServerOptions): Hono {
  const database = options.database
  const app = new Hono()
  const basePath = normalizeBasePath(options.basePath)

  app.route(basePath || "/", makeSemiosisRouter({ database }))
  return app
}

export async function startSemiosisServer(
  options: SemiosisServerOptions,
): Promise<{ server: ServerType; url: string }> {
  const app = makeApp(options)
  const hostname = options.hostname
  const port = options.port
  const basePath = normalizeBasePath(options.basePath)

  const { server, info } = await serveAndWait({
    fetch: app.fetch,
    hostname,
    port,
  })

  return {
    server,
    url: `http://${hostname}:${info.port}${basePath}`,
  }
}

function normalizeBasePath(basePath: string): string {
  if (basePath === "" || basePath === "/") return ""
  return `/${basePath.replace(/^\/+|\/+$/g, "")}`
}
