import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "@xieyuheng/semiosis.js"
import { makeWindbellRouter } from "../router/index.ts"

test("windbell router", async (t) => {
  const root = await mkdtemp(Path.join(tmpdir(), "windbell-api-"))
  const database = makeDatabase({ root })
  const app = makeWindbellRouter({
    database,
    corsOrigin: undefined,
  })

  t.after(async () => {
    await rm(root, { recursive: true, force: true })
  })

  {
    const response = await app.request("/api/health")
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      ok: true,
      service: "windbell-api",
    })
  }

  {
    const response = await app.request("/api/semiosis/health")
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      ok: true,
      service: "semiosis-api",
    })
  }

  {
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
  }

  {
    const response = await app.request("/api/semiosis/workspaces/ensure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "test",
        root: "/tmp/windbell-api-test",
      }),
    })

    assert.equal(response.status, 200)
    const workspace = (await response.json()) as { id: string }
    assert.equal(typeof workspace.id, "string")
  }
})
