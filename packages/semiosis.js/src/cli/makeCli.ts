import * as Cli from "@xieyuheng/cli.js"
import { getPackageJson } from "@xieyuheng/std.js/node"
import { fileURLToPath } from "node:url"
import { defaultDatabaseRoot, makeDatabase } from "../database/index.ts"
import { makeBatchHandler } from "./commands/batch.ts"
import { makeReplHandler } from "./commands/repl.ts"

export function makeCli() {
  const database = makeDatabase({ root: defaultDatabaseRoot() })
  const { version } = getPackageJson(fileURLToPath(import.meta.url))
  const router = Cli.createRouter("semiosis.js", version)

  router.defineRoutes([
    "repl --model <provider-name>/<model-name> --session <session-id> -- start agent repl in current directory",
    "batch --model <provider-name>/<model-name> --prompts <file> --cwd <dir> --max-output-chars <n> -- run prompts through agent",
  ])

  router.defineHandlers({
    repl: makeReplHandler({ database }),
    batch: makeBatchHandler({ database }),
  })

  return router
}
