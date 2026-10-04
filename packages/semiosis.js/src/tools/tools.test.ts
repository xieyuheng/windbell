import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeBashToolSign } from "./bash/index.ts"
import { assertSessionToolPlatform } from "./assertSessionToolPlatform.ts"
import {
  defaultShellDialect,
  makeDefaultToolRouter,
} from "./makeDefaultToolRouter.ts"
import { makePwshToolSign } from "./pwsh/index.ts"
import { resolvePwshPath } from "./pwsh/resolvePwshPath.ts"

test("defaultShellDialect chooses bash on posix and pwsh on win32", () => {
  assert.equal(defaultShellDialect("linux"), "bash")
  assert.equal(defaultShellDialect("darwin"), "bash")
  assert.equal(defaultShellDialect("win32"), "pwsh")
})

test("assertSessionToolPlatform accepts matching shell tools", () => {
  const bashSign = makeBashToolSign({ description: "Run bash." })
  const pwshSign = makePwshToolSign({ description: "Run pwsh." })

  assert.doesNotThrow(() => assertSessionToolPlatform([bashSign], "linux"))
  assert.doesNotThrow(() => assertSessionToolPlatform([pwshSign], "win32"))
})

test("assertSessionToolPlatform rejects mismatched shell tools", () => {
  const bashSign = makeBashToolSign({ description: "Run bash." })
  const pwshSign = makePwshToolSign({ description: "Run pwsh." })

  assert.throws(
    () => assertSessionToolPlatform([pwshSign], "linux"),
    /session shell tool "pwsh" does not match platform "linux"/,
  )
  assert.throws(
    () => assertSessionToolPlatform([bashSign], "win32"),
    /session shell tool "bash" does not match platform "win32"/,
  )
})

test("assertSessionToolPlatform ignores sessions without shell tools", () => {
  assert.doesNotThrow(() => assertSessionToolPlatform([], "win32"))
})

test("resolvePwshPath trusts an explicit path", () => {
  assert.equal(
    resolvePwshPath("C:\\Tools\\pwsh.exe", {}, "win32"),
    "C:\\Tools\\pwsh.exe",
  )
})

test("resolvePwshPath falls back to pwsh outside win32", () => {
  assert.equal(resolvePwshPath(undefined, {}, "linux"), "pwsh")
})

test("makeDefaultToolRouter defines the platform shell tool", () => {
  assert.equal(
    makeDefaultToolRouter({ cwd: process.cwd() }).toolSigns[0]?.name,
    defaultShellDialect(),
  )
})

test("resolvePwshPath probes well-known win32 install locations", async () => {
  const root = await fs.mkdtemp(Path.join(Os.tmpdir(), "semiosis-pwsh-path-"))

  try {
    const dir = Path.join(root, "PowerShell", "7")
    const pwshPath = Path.join(dir, "pwsh.exe")

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(pwshPath, "")

    assert.equal(
      resolvePwshPath(undefined, { ProgramFiles: root, PATH: "" }, "win32"),
      pwshPath,
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
