import { serve } from "@hono/node-server"
import { createWindbellRouter } from "../router/index.ts"
import type { WindbellServerOptions } from "./WindbellServerOptions.ts"

export function startWindbellServer(options: WindbellServerOptions) {
  const app = createWindbellRouter({
    database: options.database,
    corsOrigin: options.corsOrigin,
  })

  return serve({
    fetch: app.fetch,
    hostname: options.hostname,
    port: options.port,
  })
}
