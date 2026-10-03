import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase, type Database } from "../database/index.ts"
import * as DeepSeek from "../providers/deepseek/index.ts"
import * as OpenRouter from "../providers/openrouter/index.ts"
import { disableModel } from "./disableModel.ts"
import { enableModel } from "./enableModel.ts"
import { isModelEnabled } from "./isModelEnabled.ts"
import { setDefaultModel } from "./setDefaultModel.ts"

test("disableModel marks an enabled model as disabled", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-disable-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await database.providers.put("deepseek", {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      defaultModel: null,
    })
    await enableModel(database, "deepseek", "deepseek-flash")

    const result = await disableModel(database, "deepseek", "deepseek-flash")

    assert.equal(result, true)
    assert.equal(
      await isModelEnabled(database, "deepseek", "deepseek-flash"),
      false,
    )
    assert.deepEqual(
      (await readModelConfigsFile(database, "deepseek"))["deepseek-flash"],
      { disabled: true },
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("disableModel preserves model config", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-disable-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await writeModelConfigsFile(database, "deepseek", {
      "deepseek-flash": {
        disabled: false,
        thinking: "disabled",
        reasoningEffort: "low",
      },
    })

    const result = await disableModel(database, "deepseek", "deepseek-flash")

    assert.equal(result, true)
    assert.deepEqual(
      (await readModelConfigsFile(database, "deepseek"))["deepseek-flash"],
      {
        disabled: true,
        thinking: "disabled",
        reasoningEffort: "low",
      },
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("disableModel clears matching default model", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-disable-model-"),
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

    const result = await disableModel(database, "deepseek", "deepseek-flash")

    assert.equal(result, true)
    assert.deepEqual(await database.providers.get("deepseek"), {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
      defaultModel: null,
    })
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("disableModel returns false when model is already disabled", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-disable-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await writeModelConfigsFile(database, "deepseek", {
      "deepseek-flash": {
        disabled: true,
        thinking: "enabled",
        reasoningEffort: "high",
      },
    })

    const result = await disableModel(database, "deepseek", "deepseek-flash")

    assert.equal(result, false)
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("enableModel re-enables disabled model and preserves config", async () => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-disable-model-"),
  )

  try {
    const database = makeDatabase({ root })

    await writeModelConfigsFile(database, "deepseek", {
      "deepseek-flash": {
        disabled: true,
        thinking: "disabled",
        reasoningEffort: "low",
      },
    })

    await enableModel(database, "deepseek", "deepseek-flash")

    assert.equal(
      await isModelEnabled(database, "deepseek", "deepseek-flash"),
      true,
    )
    assert.deepEqual(
      (await readModelConfigsFile(database, "deepseek"))["deepseek-flash"],
      {
        disabled: false,
        thinking: "disabled",
        reasoningEffort: "low",
      },
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test("DeepSeek.makeModel rejects disabled config", () => {
  assert.throws(
    () =>
      DeepSeek.makeModel({} as never, {
        name: "deepseek-flash",
        disabled: true,
        thinking: "enabled",
        reasoningEffort: "high",
      }),
    /model is disabled/,
  )
})

test("OpenRouter.makeModel rejects disabled config", () => {
  assert.throws(
    () =>
      OpenRouter.makeModel({} as never, {
        name: "openrouter/free",
        disabled: true,
      }),
    /model is disabled/,
  )
})

async function readModelConfigsFile(
  database: Database,
  providerName: string,
): Promise<Record<string, unknown>> {
  const path = Path.join(database.providersRoot, providerName, "models.json")
  const text = await fs.readFile(path, "utf8")
  return JSON.parse(text) as Record<string, unknown>
}

async function writeModelConfigsFile(
  database: Database,
  providerName: string,
  value: Record<string, unknown>,
): Promise<void> {
  const path = Path.join(database.providersRoot, providerName, "models.json")
  await fs.mkdir(Path.dirname(path), { recursive: true })
  await fs.writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}
