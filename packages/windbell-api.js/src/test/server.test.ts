import assert from "node:assert/strict"
import { test } from "node:test"
import { createWindbellRouter } from "../router/index.ts"

test("GET /api/health", async () => {
  const app = createWindbellRouter()
  const response = await app.request("/api/health")

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    service: "windbell-api",
  })
})

test("POST /api/fs/exists", async () => {
  const app = createWindbellRouter()
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
