import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "../database/index.ts"
import { enableModel } from "./enableModel.ts"
import { setDefaultModel } from "./setDefaultModel.ts"

test("setDefaultModel writes provider defaultModel", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-set-default-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await database.providers.put("deepseek", {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      defaultModel: null,
    })
    await enableModel(database, "deepseek", "deepseek-flash")

    await setDefaultModel(database, "deepseek", "deepseek-flash")

    assert.deepEqual(await database.providers.get("deepseek"), {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      defaultModel: "deepseek-flash",
    })
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("setDefaultModel rejects model that is not enabled", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-set-default-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await database.providers.put("deepseek", {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      defaultModel: null,
    })

    await assert.rejects(
      () => setDefaultModel(database, "deepseek", "deepseek-flash"),
      /model is not enabled/,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("setDefaultModel rejects provider without provider info", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-set-default-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await assert.rejects(
      () => setDefaultModel(database, "deepseek", "deepseek-flash"),
      /provider not found/,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
