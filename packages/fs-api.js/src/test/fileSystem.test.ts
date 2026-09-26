import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import type { FileSystemWatchEvent } from "../index.ts"
import { makeFileSystemClient, startFileSystemServer } from "../index.ts"
import { makeFileSystemRouter } from "../router/index.ts"

test("GET /health", async () => {
  const app = makeFileSystemRouter()
  const response = await app.request("/health")

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    service: "fs-api",
  })
})

test("POST /watch streams file changes", async (t) => {
  const root = await fs.mkdtemp(Path.join(Os.tmpdir(), "windbell-watch-"))
  const app = makeFileSystemRouter()
  const controller = new AbortController()
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined

  t.after(async () => {
    controller.abort()

    if (reader !== undefined) {
      await reader.cancel().catch(() => {})
    }

    await fs.rm(root, { recursive: true, force: true })
  })

  const response = await app.request("/watch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: root }),
    signal: controller.signal,
  })

  assert.equal(response.status, 200)
  assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/)

  const body = response.body
  if (body === null) throw new Error("response body is null")

  reader = body.getReader()

  const decoder = new TextDecoder()
  let text = ""

  async function readWithTimeout(
    timeoutMs: number,
  ): Promise<ReadableStreamReadResult<Uint8Array> | "timeout"> {
    return await Promise.race([
      reader!.read(),
      new Promise<"timeout">((resolve) => {
        setTimeout(() => resolve("timeout"), timeoutMs)
      }),
    ])
  }

  while (!text.includes("event: ready")) {
    const result = await readWithTimeout(2_000)
    if (result === "timeout") break

    if (result.done) break

    text += decoder.decode(result.value, { stream: true })
  }

  assert.match(text, /event: ready/)

  await fs.writeFile(Path.join(root, "a.txt"), "hello")

  const deadline = Date.now() + 3_000
  while (!text.includes("event: change") && Date.now() < deadline) {
    const result = await readWithTimeout(200)
    if (result === "timeout") continue

    if (result.done) break

    text += decoder.decode(result.value, { stream: true })
  }

  assert.match(text, /event: change/)
  assert.match(text, /"filename":"a\.txt"/)
})

test("fileSystem client watch", async (t) => {
  const root = await fs.mkdtemp(
    Path.join(Os.tmpdir(), "windbell-watch-client-"),
  )

  const { server, url } = await startFileSystemServer({
    host: "127.0.0.1",
    port: 0,
    basePath: "/fs",
    corsOrigin: undefined,
  })

  const client = makeFileSystemClient({ baseUrl: url })
  const events: Array<FileSystemWatchEvent> = []
  const errors: Array<Error> = []
  const stop = client.watch(
    root,
    (event) => events.push(event),
    (error) => errors.push(error),
  )

  t.after(async () => {
    stop()

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })

    await fs.rm(root, { recursive: true, force: true })
  })

  await waitFor(() =>
    events.some((event) => event.type === "ready" && event.path === root),
  )

  const textFile = Path.join(root, "a.txt")
  await fs.writeFile(textFile, "hello")

  await waitFor(() =>
    events.some(
      (event) =>
        event.type === "change" &&
        event.path === textFile &&
        event.filename === "a.txt",
    ),
  )

  assert.deepEqual(errors, [])
})

test("fileSystem client and server", async (t) => {
  const root = await fs.mkdtemp(Path.join(Os.tmpdir(), "windbell-fs-"))
  const { server, url } = await startFileSystemServer({
    host: "127.0.0.1",
    port: 0,
    basePath: "/fs",
    corsOrigin: undefined,
  })
  const client = makeFileSystemClient({ baseUrl: url })

  t.after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
    await fs.rm(root, { recursive: true, force: true })
  })

  assert.equal(await client.exists(root), true)
  assert.equal(await client.isDirectory(root), true)
  assert.equal(await client.isFile(root), false)

  const textFile = Path.join(root, "notes", "a.md")
  assert.equal(await client.exists(textFile), false)

  await client.ensureFile(textFile)
  assert.equal(await client.exists(textFile), true)
  assert.equal(await client.isFile(textFile), true)

  await client.write(textFile, "# Hello")
  assert.equal(await client.read(textFile), "# Hello")

  const emptyFile = Path.join(root, "empty.txt")
  await client.ensureFile(emptyFile)
  assert.equal(await client.read(emptyFile), "")

  await client.ensureDirectory(Path.join(root, "empty-dir"))
  assert.deepEqual(await client.list(Path.join(root, "empty-dir")), [])

  assert.deepEqual(await client.list(Path.join(root, "notes")), [textFile])

  const listRoot = await client.list(root)
  assert.deepEqual(listRoot, [
    Path.join(root, "empty-dir"),
    emptyFile,
    Path.join(root, "notes"),
  ])

  const entries = await client.listEntries(root)
  assert.deepEqual(entries, [
    {
      name: "empty-dir",
      path: Path.join(root, "empty-dir"),
      kind: "Directory",
    },
    {
      name: "empty.txt",
      path: emptyFile,
      kind: "File",
    },
    {
      name: "notes",
      path: Path.join(root, "notes"),
      kind: "Directory",
    },
  ])

  const recursive = await client.listRecursive(root)
  assert.deepEqual(recursive, [
    Path.join(root, "empty-dir"),
    emptyFile,
    Path.join(root, "notes"),
    textFile,
  ])

  const renamedFile = Path.join(root, "renamed.md")
  await client.rename(textFile, renamedFile)
  assert.equal(await client.exists(textFile), false)
  assert.equal(await client.read(renamedFile), "# Hello")

  await client.deleteFile(renamedFile)
  assert.equal(await client.exists(renamedFile), false)

  await client.deleteDirectory(Path.join(root, "empty-dir"))
  assert.equal(await client.exists(Path.join(root, "empty-dir")), false)

  await client.delete(Path.join(root, "notes"))
  assert.equal(await client.exists(Path.join(root, "notes")), false)
})

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 3_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs

  while (!predicate() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  assert.equal(predicate(), true)
}
