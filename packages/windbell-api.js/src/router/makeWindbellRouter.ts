import { makeFileSystemRouter } from "@xieyuheng/fs-api.js"
import { makeSemiosisRouter } from "@xieyuheng/semiosis-api.js"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { health } from "../service/index.ts"
import type { WindbellRouterOptions } from "./WindbellRouterOptions.ts"

export function makeWindbellRouter(options: WindbellRouterOptions): Hono {
  const app = new Hono()

  if (options.corsOrigin !== undefined) {
    app.use("*", cors({ origin: options.corsOrigin }))
  }

  app.get("/api/health", async (c) => {
    return c.json(await health())
  })

  app.route("/api/fs", makeFileSystemRouter())

  app.route(
    "/api/semiosis",
    makeSemiosisRouter({
      database: options.database,
    }),
  )

  return app
}
