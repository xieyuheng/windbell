import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase, UserSign } from "@xieyuheng/semiosis.js"
import { makeSemiosisClient, startSemiosisServer } from "../index.ts"

test("semiosis client and server", async (t) => {
  const root = await mkdtemp(Path.join(tmpdir(), "semiosis-api-"))
  const database = makeDatabase({ root })
  const { server, url } = await startSemiosisServer({ database })
  const client = makeSemiosisClient({ baseUrl: url })

  t.after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
    await rm(root, { recursive: true, force: true })
  })

  assert.deepEqual(await client.health(), {
    ok: true,
    service: "semiosis-api",
  })

  const workspace = await client.workspaces.ensure({
    name: "test",
    root: "/tmp/test",
  })
  assert.equal(workspace.name, "test")
  assert.equal(workspace.root, "/tmp/test")

  const sameWorkspace = await client.workspaces.ensure({
    name: "another-name",
    root: "/tmp/test",
  })
  assert.equal(sameWorkspace.id, workspace.id)

  const session = await client.sessions.make({
    workspaceId: workspace.id,
    title: "test session",
  })
  assert.equal(session.context.length, 0)

  await client.sessions.appendSign(session.id, UserSign("hello"))

  const gotSession = await client.sessions.get(session.id)
  assert.equal(gotSession?.context.length, 1)

  const indexes = await client.sessions.list({
    workspaceId: workspace.id,
  })
  assert.equal(indexes.length, 1)
  assert.equal(indexes[0]?.id, session.id)

  await client.sessions.remove(session.id)
  assert.equal(await client.sessions.get(session.id), undefined)

  await client.workspaces.remove(workspace.id)
  assert.equal(await client.workspaces.get(workspace.id), undefined)
})
