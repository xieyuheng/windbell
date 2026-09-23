import Path from "node:path"
import process from "node:process"
import type { HandlerContext } from "@xieyuheng/cli.js"
import { agentRun } from "../../agent/index.ts"
import type { Database } from "../../database/index.ts"
import { formatSign } from "../../format/index.ts"
import { readPromptBatch } from "../../prompts/index.ts"
import { PersonaSign, UserSign, type Sign } from "../../sign/index.ts"
import { makeToolRouter } from "../../tool/index.ts"
import { makeBashToolHandler, makeBashToolSign } from "../../tools/index.ts"
import {
  parsePositiveInt,
  readOptionalOption,
  readRequiredOption,
} from "../options.ts"
import {
  ensureWorkspace,
  getOrMakeSession,
  makeAgentForCli,
  makeInitialSigns,
  makeModelFromOptions,
} from "../shared.ts"

export type BatchCommandOptions = {
  database: Database
}

export function makeBatchHandler(options: BatchCommandOptions) {
  return async (context: HandlerContext) => {
    const model = makeModelFromOptions(context.options)

    const promptsPath = readRequiredOption(context.options, "--prompts")
    const promptBatch = readPromptBatch(promptsPath)

    const cwd = Path.resolve(
      readOptionalOption(context.options, "--cwd") ?? process.cwd(),
    )
    const workspace = await ensureWorkspace({
      database: options.database,
      cwd,
    })

    const maxOutputChars = parsePositiveInt(
      context.options["--max-output-chars"],
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

    const initialSigns: Array<Sign> = makeInitialSigns(toolRouter, personaSign)

    const session = await getOrMakeSession({
      database: options.database,
      workspace,
      title: "untitled",
      initialSigns,
    })

    const agent = await makeAgentForCli({
      database: options.database,
      sessionId: session.id,
      model,
      toolRouter,
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
  }
}
