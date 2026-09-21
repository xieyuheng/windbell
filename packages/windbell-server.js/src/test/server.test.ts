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
