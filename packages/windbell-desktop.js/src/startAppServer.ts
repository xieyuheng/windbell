import { app } from "electron"
import * as S from "@windbell/semiosis.js"
import { startWindbellServer } from "@windbell/windbell-api.js"
import Path from "node:path"
import { fileURLToPath } from "node:url"
import type { MainState } from "./MainState.ts"

export type StartAppServerOptions = {
  hostname: string
  port: number
}

export async function startAppServer(
  state: MainState,
  options: StartAppServerOptions,
): Promise<void> {
  const database = S.makeDatabase({
    root: S.defaultDatabaseRoot(),
  })

  console.log("[windbell-desktop] starting app server")

  const { server, info } = await startWindbellServer({
    database,
    hostname: options.hostname,
    port: options.port,
    corsOrigin: undefined,
    webDistRoot: resolveWebDistRoot(),
  })

  state.appServer = server
  state.appUrl = `http://${options.hostname}:${info.port}/`

  console.log(`[windbell-desktop] app listening at ${state.appUrl}`)
}

function resolveWebDistRoot(): string {
  if (app.isPackaged) {
    return Path.join(process.resourcesPath, "web")
  }

  const dirname = Path.dirname(fileURLToPath(import.meta.url))

  return (
    process.env.WINDBELL_WEB_DIST ??
    Path.resolve(dirname, "../../windbell-web.js/dist")
  )
}
