import { createFileSystemRouter } from "@xieyuheng/fs-api.js"
import { Hono } from "hono"
import { health } from "../service/index.ts"

export function createWindbellRouter(): Hono {
  const app = new Hono()

  app.get("/api/health", async (c) => {
    return c.json(await health())
  })

  app.route("/api/fs", createFileSystemRouter({}))

  return app
}
