import assert from "node:assert/strict"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import Path from "node:path"
import { test } from "node:test"
import * as S from "@xieyuheng/semiosis.js"
import { makeSemiosisClient, startSemiosisServer } from "../index.ts"

test("semiosis client and server", async (t) => {
  const root = await mkdtemp(Path.join(tmpdir(), "semiosis-api-"))
  const database = S.makeDatabase({ root })

  await database.providers.put("deepseek", {
    baseUrl: "https://example.com",
    key: "test-key",
  })
  await database.models.put("deepseek", "chat", {})

  const { server, url } = await startSemiosisServer({
    database,
    hostname: "127.0.0.1",
    port: 0,
    basePath: "",
  })
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

  assert.deepEqual(await client.models.list(), [
    {
      qualifiedName: "deepseek/chat",
    },
  ])

  assert.deepEqual(await client.settings.get(), {
    defaultModel: null,
  })

  await client.settings.put({
    defaultModel: {
      qualifiedName: "deepseek/chat",
    },
  })

  assert.deepEqual(await client.settings.get(), {
    defaultModel: {
      qualifiedName: "deepseek/chat",
    },
  })

  const workspaceRoot = Path.join(root, "workspace")
  await mkdir(workspaceRoot, { recursive: true })
  await writeFile(Path.join(workspaceRoot, "README.md"), "# Test\n")

  const workspace = await client.workspaces.ensure({
    name: "test",
    root: workspaceRoot,
  })
  assert.equal(workspace.name, "test")
  assert.equal(workspace.root, workspaceRoot)

  const sameWorkspace = await client.workspaces.ensure({
    name: "another-name",
    root: workspaceRoot,
  })
  assert.equal(sameWorkspace.id, workspace.id)

  const session = await client.sessions.make({
    workspaceId: workspace.id,
    title: "test session",
  })
  assert.ok(session.context.length > 0)
  assert.equal(session.context[0]?.kind, "ToolSign")

  const result = await client.sessions.interpret(session.id, {
    model: {
      qualifiedName: "mock/conversation",
    },
    input: [S.UserSign("hello")],
  })
  assert.ok(result.signs.length > 0)

  const gotSession = await client.sessions.get(session.id)
  assert.ok((gotSession?.context.length ?? 0) > 1)

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
