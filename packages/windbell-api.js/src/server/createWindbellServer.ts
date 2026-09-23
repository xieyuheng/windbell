import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import fs from "node:fs/promises"
import Path from "node:path"
import { createWindbellRouter } from "../router/index.ts"
import type { WindbellServerOptions } from "./WindbellServerOptions.ts"

export function startWindbellServer(options: WindbellServerOptions) {
  const app = createWindbellRouter({
    database: options.database,
    corsOrigin: options.corsOrigin,
  })

  if (options.webDistRoot !== undefined) {
    const webDistRoot = options.webDistRoot

    app.use(
      "*",
      serveStatic({
        root: webDistRoot,
      }),
    )

    app.get("*", async (c) => {
      const index = await fs.readFile(
        Path.join(webDistRoot, "index.html"),
        "utf8",
      )
      return c.html(index)
    })
  }

  return serve({
    fetch: app.fetch,
    hostname: options.hostname,
    port: options.port,
  })
}
