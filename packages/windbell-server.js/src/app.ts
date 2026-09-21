import { createFileSystemRouter } from "@xieyuheng/fs-api.js"
import { Hono } from "hono"

export function createApp(): Hono {
  const app = new Hono()

  app.get("/health", (c) =>
    c.json({
      ok: true,
      service: "windbell-server",
    }),
  )

  app.route("/api/fs", createFileSystemRouter())

  return app
}
