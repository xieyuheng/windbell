import { serve, type ServerType } from "@hono/node-server"
import { makeDatabase } from "@xieyuheng/semiosis.js"
import { Hono } from "hono"
import type { AddressInfo } from "node:net"
import { createSemiosisRouter } from "../router/index.ts"
import type { SemiosisServerOptions } from "./SemiosisServerOptions.ts"

function createApp(options: SemiosisServerOptions): Hono {
  const database = options.database ?? makeDatabase()
  const app = new Hono()
  const basePath = normalizeBasePath(options.basePath)

  app.route(basePath || "/", createSemiosisRouter({ database }))
  return app
}

export async function startSemiosisServer(
  options: SemiosisServerOptions = {},
): Promise<{ server: ServerType; url: string }> {
  const app = createApp(options)
  const hostname = options.hostname ?? "127.0.0.1"
  const port = options.port ?? 0
  const basePath = normalizeBasePath(options.basePath)

  const { server, url } = await new Promise<{
    server: ServerType
    url: string
  }>((resolve, reject) => {
    const server = serve(
      {
        fetch: app.fetch,
        hostname,
        port,
      },
      (info: AddressInfo) => {
        resolve({
          server,
          url: `http://${hostname}:${info.port}${basePath}`,
        })
      },
    )

    server.once("error", reject)
  })

  return { server, url }
}

function normalizeBasePath(basePath: string | undefined): string {
  if (basePath === undefined || basePath === "" || basePath === "/") return ""
  return `/${basePath.replace(/^\/+|\/+$/g, "")}`
}
