import process from "node:process"
import type * as Cli from "@xieyuheng/cli.js"
import type { Database } from "../../database/index.ts"
import { startAgentRepl } from "../../repl/index.ts"
import { readOptionalOption } from "../options.ts"
import { ensureWorkspace, makeModelFromOptions } from "../shared.ts"

export type ReplCommandOptions = {
  database: Database
}

export function makeReplHandler(options: ReplCommandOptions) {
  return async (context: Cli.HandlerContext) => {
    const model = await makeModelFromOptions({
      database: options.database,
      cliOptions: context.options,
    })
    const workspace = await ensureWorkspace({
      database: options.database,
      cwd: process.cwd(),
    })

    const sessionId = readOptionalOption(context.options, "--session")

    printReplHeader({
      name: context.router.name,
      version: context.router.version,
    })

    return startAgentRepl({
      database: options.database,
      workspace,
      model,
      sessionId,
    })
  }
}

function printReplHeader(options: { name: string; version: string }): void {
  console.log(`${options.name} ${options.version}`)
  console.log()
}
