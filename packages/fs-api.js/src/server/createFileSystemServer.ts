import { serve, type ServerType } from "@hono/node-server"
import { Hono } from "hono"
import type { AddressInfo } from "node:net"
import { createFileSystemRouter } from "../router/index.ts"
import type { FileSystemServerOptions } from "./FileSystemServerOptions.ts"

function createApp(options: FileSystemServerOptions): Hono {
  const app = new Hono()
  app.route(
    normalizeBasePath(options.basePath) || "/",
    createFileSystemRouter(options),
  )
  return app
}

export async function startFileSystemServer(
  options: FileSystemServerOptions,
): Promise<{ server: ServerType; url: string }> {
  const app = createApp(options)
  const hostname = options.host
  const port = options.port
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

function normalizeBasePath(basePath: string): string {
  if (basePath === "" || basePath === "/") return ""
  return `/${basePath.replace(/^\/+|\/+$/g, "")}`
}
