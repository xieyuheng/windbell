import assert from "node:assert/strict"
import { test } from "node:test"
import { createApp } from "../app.ts"

test("GET /health", async () => {
  const app = createApp()
  const response = await app.request("/health")

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    service: "windbell-server",
  })
})

test("POST /api/fs/exists", async () => {
  const app = createApp()
  const response = await app.request("/api/fs/exists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: process.cwd(),
    }),
  })

  assert.equal(response.status, 200)
  assert.equal(await response.json(), true)
})
