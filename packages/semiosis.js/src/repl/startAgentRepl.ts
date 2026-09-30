import * as Readline from "node:readline"
import process from "node:process"
import { createSession } from "../session/index.ts"
import { runAgentRepl } from "./runAgentRepl.ts"
import {
  makeAgentForRepl,
  makeInfoPrinter,
  makeInitialSigns,
  makeReplToolRouter,
  makeTitleChangeHandler,
  type AgentReplOptions,
} from "./shared.ts"

export type StartAgentReplOptions = AgentReplOptions

export async function startAgentRepl(
  options: StartAgentReplOptions,
): Promise<void> {
  const toolRouter = makeReplToolRouter(options)
  const initialSigns = makeInitialSigns(toolRouter)
  const firstInput = await readFirstInput()
  if (firstInput === undefined) return

  const session = await createSession({
    database: options.database,
    workspace: options.workspace,
    title: "untitled",
    initialSigns,
  })
  const agent = await makeAgentForRepl(options, session, toolRouter)

  await runAgentRepl(agent, {
    initialUserInput: firstInput,
    showContext: false,
    onInfo: makeInfoPrinter(options, agent, session),
    onTitleChange: makeTitleChangeHandler(options.database, session),
  })
}

async function readFirstInput(): Promise<string | undefined> {
  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const readLine = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const onLine = (line: string): void => {
        cleanup()
        resolve(line)
      }

      const onClose = (): void => {
        cleanup()
        resolve(undefined)
      }

      const cleanup = (): void => {
        readline.off("line", onLine)
        readline.off("close", onClose)
      }

      readline.once("line", onLine)
      readline.once("close", onClose)
    })
  }

  try {
    while (true) {
      readline.setPrompt("> ")
      readline.prompt()

      const line = await readLine()
      if (line === undefined) return undefined

      const input = line.trim()
      if (input === "") continue

      if (input === "/info" || input === "/title") {
        console.log(`${input} is not available before a session is created.`)
        continue
      }

      return line
    }
  } finally {
    readline.close()
  }
}
