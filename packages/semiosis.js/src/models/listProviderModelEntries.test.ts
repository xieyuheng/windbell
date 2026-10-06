import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "../database/index.ts"
import { listProviderModelEntries } from "./listProviderModelEntries.ts"
import { pinModel } from "./pinModel.ts"
import { unpinModel } from "./unpinModel.ts"

test("listProviderModelEntries returns provider model entries", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-list-provider-model-entries-"),
  )

  try {
    const database = makeDatabase({ root })

    await pinModel(database, "deepseek", "deepseek-flash")

    assert.deepEqual(await summary(database), [
      {
        providerName: "deepseek",
        name: "deepseek-flash",
        pinned: true,
        isDefault: true,
        configPinned: true,
      },
    ])

    await unpinModel(database, "deepseek", "deepseek-flash")

    assert.deepEqual(await summary(database), [
      {
        providerName: "deepseek",
        name: "deepseek-flash",
        pinned: false,
        isDefault: true,
        configPinned: false,
      },
    ])
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

async function summary(database: ReturnType<typeof makeDatabase>) {
  const entries = await listProviderModelEntries(database, "deepseek")

  return entries.map((entry) => ({
    providerName: entry.providerName,
    name: entry.name,
    pinned: entry.pinned,
    isDefault: entry.isDefault,
    configPinned: entry.config?.pinned,
  }))
}
