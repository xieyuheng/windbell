import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "../database/index.ts"
import { disableModel } from "./disableModel.ts"
import { enableModel } from "./enableModel.ts"
import { listProviderModelEntries } from "./listProviderModelEntries.ts"

test("listProviderModelEntries returns provider model entries", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-list-provider-model-entries-"),
  )

  try {
    const database = makeDatabase({ root })

    await enableModel(database, "deepseek", "deepseek-chat")
    await enableModel(database, "deepseek", "deepseek-flash")
    await disableModel(database, "deepseek", "deepseek-chat")

    const entries = await listProviderModelEntries(database, "deepseek")

    assert.deepEqual(
      entries.map((entry) => ({
        providerName: entry.providerName,
        name: entry.name,
        enabled: entry.enabled,
        isDefault: entry.isDefault,
        disabled: entry.config?.disabled,
      })),
      [
        {
          providerName: "deepseek",
          name: "deepseek-chat",
          enabled: false,
          isDefault: false,
          disabled: true,
        },
        {
          providerName: "deepseek",
          name: "deepseek-flash",
          enabled: true,
          isDefault: true,
          disabled: false,
        },
      ],
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
