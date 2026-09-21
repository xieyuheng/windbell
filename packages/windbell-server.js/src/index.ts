import { serve } from "@hono/node-server"
import { createApp } from "./app.ts"

export * from "./app.ts"

export type StartServerOptions = {
  hostname?: string
  port?: number
}

export function startServer(options: StartServerOptions = {}) {
  const hostname = options.hostname ?? "127.0.0.1"
  const port = options.port ?? 3000
  const app = createApp()

  return serve({
    fetch: app.fetch,
    hostname,
    port,
  })
}
