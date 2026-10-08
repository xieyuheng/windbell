import assert from "node:assert/strict"
import { test } from "node:test"
import type { Model } from "../model/index.ts"
import { AssistantSign } from "../sign/index.ts"
import { generateTitle } from "./generateTitle.ts"

function makeModel(interpret: Model["interpret"]): Model {
  return {
    providerName: "test",
    name: "test",
    interpret,
  }
}

test("generateTitle returns ok with trimmed assistant content", async () => {
  const model = makeModel(async () => [AssistantSign("  Hello title  ")])

  const result = await generateTitle({
    model,
    context: [],
  })

  assert.deepEqual(result, { kind: "ok", title: "Hello title" })
})

test("generateTitle returns empty when no assistant sign is present", async () => {
  const model = makeModel(async () => [])

  const result = await generateTitle({
    model,
    context: [],
  })

  assert.deepEqual(result, { kind: "empty" })
})

test("generateTitle returns error when model.interpret throws", async () => {
  const error = new Error("boom")
  const model = makeModel(async () => {
    throw error
  })

  const result = await generateTitle({
    model,
    context: [],
  })

  assert.equal(result.kind, "error")
  if (result.kind !== "error") return
  assert.equal(result.error, error)
})
