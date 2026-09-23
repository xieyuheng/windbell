import { serve } from "@hono/node-server"
import { createWindbellRouter } from "../router/index.ts"
import type { WindbellServerOptions } from "./WindbellServerOptions.ts"

export function startWindbellServer(options: WindbellServerOptions = {}) {
  const hostname = options.hostname ?? "127.0.0.1"
  const port = options.port ?? 3000
  const app = createWindbellRouter()

  return serve({
    fetch: app.fetch,
    hostname,
    port,
  })
}
