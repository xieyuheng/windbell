import type { ServerType } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { makeFileSystemRouter } from "../router/index.ts"
import type { FileSystemServerOptions } from "./FileSystemServerOptions.ts"
import { serveAndWait } from "./serveAndWait.ts"

function makeApp(options: FileSystemServerOptions): Hono {
  const app = new Hono()

  if (options.corsOrigin !== undefined) {
    app.use("*", cors({ origin: options.corsOrigin }))
  }

  app.route(normalizeBasePath(options.basePath) || "/", makeFileSystemRouter())
  return app
}

export async function startFileSystemServer(
  options: FileSystemServerOptions,
): Promise<{ server: ServerType; url: string }> {
  const app = makeApp(options)
  const hostname = options.host
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
