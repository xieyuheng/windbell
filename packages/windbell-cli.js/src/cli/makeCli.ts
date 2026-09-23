import * as Cli from "@xieyuheng/cli.js"
import { getPackageJson } from "@xieyuheng/std.js/node"
import { fileURLToPath } from "node:url"
import { makeDevHandler } from "./commands/dev.ts"
import { makeStartHandler } from "./commands/start.ts"

export function makeCli() {
  const { version } = getPackageJson(fileURLToPath(import.meta.url))
  const router = Cli.makeRouter("windbell-cli.js", version)

  router.defineRoutes([
    "start --host <host> --port <port> --cors-origin <origin> --database-root <path> --web-dist-root <path> -- start windbell api and web",
    "dev --host <host> --api-port <port> --web-port <port> --database-root <path> --web-source-root <path> -- start windbell api and web dev server",
  ])

  router.defineHandlers({
    start: makeStartHandler(),
    dev: makeDevHandler(),
  })

  return router
}
