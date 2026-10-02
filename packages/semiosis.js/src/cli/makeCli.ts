import * as Cli from "@xieyuheng/cli.js"
import { getPackageJson } from "@xieyuheng/std.js/node"
import { fileURLToPath } from "node:url"
import { defaultDatabaseRoot, makeDatabase } from "../database/index.ts"
import { makeBatchHandler } from "./commands/BatchCommand.ts"
import { makeModelListHandler } from "./commands/ModelListCommand.ts"
import { makeProviderListHandler } from "./commands/ProviderListCommand.ts"
import { makeReplHandler } from "./commands/ReplCommand.ts"

export function makeCli() {
  const database = makeDatabase({ root: defaultDatabaseRoot() })
  const { version } = getPackageJson(fileURLToPath(import.meta.url))
  const router = Cli.makeRouter("semiosis.js", version)

  router.defineRoutes([
    "provider-list -- list supported providers",
    "model-list --provider <provider-name> --all -- list models (use --all to include disabled models)",
    "repl --provider <provider-name> --model <model-name> --session <session-id> -- start agent repl in current directory",
    "batch --provider <provider-name> --model <model-name> --prompts <file> --cwd <dir> --max-output-chars <n> -- run prompts through agent",
  ])

  router.defineHandlers({
    "provider-list": makeProviderListHandler({ database }),
    "model-list": makeModelListHandler({ database }),
    repl: makeReplHandler({ database }),
    batch: makeBatchHandler({ database }),
  })

  return router
}
