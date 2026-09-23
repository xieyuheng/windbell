#!/usr/bin/env -S node

import * as cli from "@xieyuheng/cli.js"
import { errorReport } from "@xieyuheng/std.js/error"
import { getPackageJson } from "@xieyuheng/std.js/node"
import Path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { agentRun } from "./agent/index.ts"
import { makeDatabase } from "./database/index.ts"
import { formatSign } from "./format/index.ts"
import { makeModel } from "./models/index.ts"
import { readPromptBatch } from "./prompts/index.ts"
import { makeAgentFromSession, type Session } from "./session/index.ts"
import { PersonaSign, UserSign, type Sign } from "./sign/index.ts"
import { startAgentRepl } from "./repl/index.ts"
import { makeToolRouter } from "./tool/index.ts"
import {
  makeBashToolHandler,
  makeBashToolSign,
  makeDefaultToolRouter,
} from "./tools/index.ts"
import type { Workspace } from "./workspace/Workspace.ts"

const { version } = getPackageJson(fileURLToPath(import.meta.url))
const router = cli.createRouter("semiosis.js", version)
const database = makeDatabase()

router.defineRoutes([
  "repl --model <provider-name>/<model-name> --session <session-id> -- start agent repl in current directory",
  "batch --model <provider-name>/<model-name> --prompts <file> --cwd <dir> --max-output-chars <n> -- run prompts through agent",
])

router.defineHandlers({
  repl: async ({ options }) => {
    const modelSpec = readRequiredOption(options, "--model")
    const [providerName, modelName] = parseQualifiedName(modelSpec)
    const model = makeModel(providerName, modelName)

    const cwd = process.cwd()
    const workspace = await database.workspaces.ensure({
      name: workspaceNameFromRoot(cwd),
      root: cwd,
    })

    const toolRouter = makeDefaultToolRouter({ cwd: workspace.root })
    const initialSigns: Array<Sign> = [
      ...toolRouter.toolSigns,
      PersonaSign("You are a helpful software engineer assistant."),
    ]

    const session = await getOrMakeSession({
      sessionId: readOptionalOption(options, "--session"),
      workspace,
      title: "untitled",
      initialSigns,
    })

    const agent = await makeAgentFromSession({
      database,
      sessionId: session.id,
      model,
      makeToolRouter: () => toolRouter,
    })

    return startAgentRepl(agent)
  },

  batch: async ({ options }) => {
    const modelSpec = readRequiredOption(options, "--model")
    const promptsPath = readRequiredOption(options, "--prompts")
    const promptBatch = readPromptBatch(promptsPath)

    const [providerName, modelName] = parseQualifiedName(modelSpec)
    const model = makeModel(providerName, modelName)

    const cwd = Path.resolve(options["--cwd"] ?? process.cwd())
    const workspace = await database.workspaces.ensure({
      name: workspaceNameFromRoot(cwd),
      root: cwd,
    })

    const maxOutputChars = parsePositiveInt(
      options["--max-output-chars"],
      200_000,
    )

    const personaSign = PersonaSign(promptBatch.system)
    const toolRouter = makeToolRouter()
    toolRouter.defineTool(
      makeBashToolSign({
        description: "Run commands in a bash shell.",
      }),
      makeBashToolHandler({
        cwd: workspace.root,
        timeoutMs: 300_000,
        maxOutputChars,
      }),
    )

    const session = await getOrMakeSession({
      workspace,
      title: "untitled",
      initialSigns: [...toolRouter.toolSigns, personaSign],
    })

    const agent = await makeAgentFromSession({
      database,
      sessionId: session.id,
      model,
      makeToolRouter: () => toolRouter,
    })

    for (const sign of toolRouter.toolSigns) {
      console.log(formatSign(sign))
    }
    console.log(formatSign(personaSign))

    for (const prompt of promptBatch.prompts) {
      const userSign = UserSign(prompt)
      console.log(formatSign(userSign))

      for await (const sign of agentRun(agent, userSign)) {
        console.log(formatSign(sign))
      }
    }
  },
})

try {
  await router.run(process.argv.slice(2))
} catch (error) {
  console.log(errorReport(error))
  process.exit(1)
}

async function getOrMakeSession(options: {
  sessionId?: string
  workspace: Workspace
  title: string
  initialSigns: Array<Sign>
}): Promise<Session> {
  if (options.sessionId !== undefined) {
    const session = await database.sessions.get(options.sessionId)
    if (session === undefined) {
      throw new Error(`session not found: ${options.sessionId}`)
    }

    if (session.workspaceId !== options.workspace.id) {
      throw new Error(
        `session workspace mismatch: ${options.sessionId} belongs to ${session.workspaceId}`,
      )
    }

    return session
  }

  const session = await database.sessions.make({
    workspaceId: options.workspace.id,
    title: options.title,
  })

  session.context = [...options.initialSigns]
  await database.sessions.put(session)
  return session
}

function workspaceNameFromRoot(root: string): string {
  const resolved = Path.resolve(root)
  const name = Path.basename(resolved)
  return name === "" ? resolved : name
}

function parseQualifiedName(text: string): [string, string] {
  const [providerName, modelName, ...rest] = text.split("/")
  if (
    providerName === undefined ||
    modelName === undefined ||
    providerName === "" ||
    modelName === "" ||
    rest.length !== 0
  ) {
    throw new Error(
      `invalid --model: ${text}, expected <provider-name>/<model-name>`,
    )
  }

  return [providerName, modelName]
}

function readRequiredOption(
  options: Record<string, string>,
  name: string,
): string {
  const value = options[name]
  if (value === undefined || value === "") {
    throw new Error(`missing option: ${name}`)
  }

  return value
}

function readOptionalOption(
  options: Record<string, string>,
  name: string,
): string | undefined {
  const value = options[name]
  if (value === undefined || value === "") {
    return undefined
  }

  return value
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback

  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`invalid positive integer: ${value}`)
  }

  return number
}
