import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "../database/index.ts"
import { disableModel } from "./disableModel.ts"
import { enableModel } from "./enableModel.ts"
import { listModelSummaries } from "./listModelSummaries.ts"

test("listModelSummaries returns enabled and disabled models", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-list-model-summaries-"),
  )

  try {
    const database = makeDatabase({ root })

    await enableModel(database, "deepseek", "deepseek-chat")
    await enableModel(database, "deepseek", "deepseek-flash")
    await disableModel(database, "deepseek", "deepseek-flash")

    assert.deepEqual(await listModelSummaries(database, "deepseek"), [
      {
        name: "deepseek-chat",
        enabled: true,
      },
      {
        name: "deepseek-flash",
        enabled: false,
      },
    ])
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
