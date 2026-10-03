import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "../database/index.ts"
import { setDefaultProvider } from "./setDefaultProvider.ts"

test("setDefaultProvider writes settings.defaultProvider", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-set-default-provider-"),
  )

  try {
    const database = makeDatabase({ root })

    await database.providers.put("deepseek", {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      defaultModel: null,
    })

    await setDefaultProvider(database, "deepseek")

    assert.deepEqual(await database.settings.get(), {
      defaultProvider: "deepseek",
    })
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("setDefaultProvider rejects unsupported provider", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-set-default-provider-"),
  )

  try {
    const database = makeDatabase({ root })

    await assert.rejects(
      () => setDefaultProvider(database, "unknown"),
      /unsupported provider/,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("setDefaultProvider rejects provider without provider info", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-set-default-provider-"),
  )

  try {
    const database = makeDatabase({ root })

    await assert.rejects(
      () => setDefaultProvider(database, "deepseek"),
      /provider not found/,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
