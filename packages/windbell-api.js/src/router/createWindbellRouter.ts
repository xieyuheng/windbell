import { createFileSystemRouter } from "@xieyuheng/fs-api.js"
import { createSemiosisRouter } from "@xieyuheng/semiosis-api.js"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { health } from "../service/index.ts"
import type { WindbellRouterOptions } from "./WindbellRouterOptions.ts"

export function createWindbellRouter(options: WindbellRouterOptions): Hono {
  const app = new Hono()

  if (options.corsOrigin !== undefined) {
    app.use("*", cors({ origin: options.corsOrigin }))
  }

  app.get("/api/health", async (c) => {
    return c.json(await health())
  })

  app.route("/api/fs", createFileSystemRouter())

  app.route(
    "/api/semiosis",
    createSemiosisRouter({
      database: options.database,
    }),
  )

  return app
}
