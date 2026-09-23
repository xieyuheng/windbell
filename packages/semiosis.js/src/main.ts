#!/usr/bin/env -S node

import * as cli from "@xieyuheng/cli.js"
import { errorReport } from "@xieyuheng/std.js/error"
import { getPackageJson } from "@xieyuheng/std.js/node"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { agentRun, makeAgent } from "./agent/index.ts"
import { formatSign } from "./format/index.ts"
import { makeModel } from "./models/index.ts"
import { readPromptBatch } from "./prompts/index.ts"
import { PersonaSign, UserSign, type Sign } from "./sign/index.ts"
import { startAgentRepl } from "./repl/index.ts"
import { makeToolRouter } from "./tool/index.ts"
import {
  makeBashToolHandler,
  makeBashToolSign,
  makeDefaultToolRouter,
} from "./tools/index.ts"

const { version } = getPackageJson(fileURLToPath(import.meta.url))
const router = cli.createRouter("semiosis.js", version)

router.defineRoutes([
  "repl --model <provider-name>/<model-name> -- start agent repl in current directory",
  "batch --model <provider-name>/<model-name> --prompts <file> --cwd <dir> --max-output-chars <n> -- run prompts through agent",
])

router.defineHandlers({
  repl: ({ options }) => {
    const modelSpec = readRequiredOption(options, "--model")

    const [providerName, modelName] = parseQualifiedName(modelSpec)
    const model = makeModel(providerName, modelName)
    const toolRouter = makeDefaultToolRouter({ cwd: process.cwd() })
    const context: Array<Sign> = [
      ...toolRouter.toolSigns,
      PersonaSign("You are a helpful software engineer assistant."),
    ]
    const agent = makeAgent({
      model,
      toolRouter,
      getContext: async () => context,
      appendContext: async (signs) => {
        context.push(...signs)
      },
    })
    return startAgentRepl(agent)
  },

  batch: async ({ options }) => {
    const modelSpec = readRequiredOption(options, "--model")
    const promptsPath = readRequiredOption(options, "--prompts")
    const promptBatch = readPromptBatch(promptsPath)

    const [providerName, modelName] = parseQualifiedName(modelSpec)
    const model = makeModel(providerName, modelName)
    const cwd = options["--cwd"] ?? process.cwd()
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
        cwd,
        timeoutMs: 300_000,
        maxOutputChars,
      }),
    )
    const context: Array<Sign> = [...toolRouter.toolSigns, personaSign]
    const agent = makeAgent({
      model,
      toolRouter,
      getContext: async () => context,
      appendContext: async (signs) => {
        context.push(...signs)
      },
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

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback

  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`invalid positive integer: ${value}`)
  }

  return number
}
