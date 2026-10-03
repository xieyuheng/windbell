import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { deleteApiKey, readApiKey, writeApiKey } from "./apiKey.ts"
import { makeDatabase } from "./Database.ts"

test("write, read and delete provider api key", async () => {
  const root = await fs.mkdtemp(Path.join(Os.tmpdir(), "windbell-api-key-"))

  try {
    const database = makeDatabase({ root })

    await writeApiKey(database, "deepseek", "  sk-test  \n")
    assert.equal(await readApiKey(database, "deepseek"), "sk-test")

    assert.equal(await deleteApiKey(database, "deepseek"), true)
    assert.equal(await deleteApiKey(database, "deepseek"), false)

    await assert.rejects(
      () => readApiKey(database, "deepseek"),
      /api key not found/,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("writeApiKey rejects empty api key", async () => {
  const root = await fs.mkdtemp(Path.join(Os.tmpdir(), "windbell-api-key-"))

  try {
    const database = makeDatabase({ root })

    await assert.rejects(
      () => writeApiKey(database, "deepseek", "   \n"),
      /api key is empty/,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
