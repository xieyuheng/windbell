import { app } from "electron"
import * as S from "@xieyuheng/semiosis.js"
import { startWindbellServer } from "@xieyuheng/windbell-api.js"
import Path from "node:path"
import { fileURLToPath } from "node:url"
import type { MainState } from "./MainState.ts"

const HOSTNAME = "127.0.0.1"
const PORT = 17344

export async function startApiServer(state: MainState): Promise<void> {
  const database = S.makeDatabase({
    root: S.defaultDatabaseRoot(),
  })

  console.log("[windbell-desktop] starting api server")

  const { server, info } = await startWindbellServer({
    database,
    hostname: HOSTNAME,
    port: PORT,
    corsOrigin: undefined,
    webDistRoot: resolveWebDistRoot(),
  })

  state.apiServer = server
  state.appUrl = `http://${HOSTNAME}:${info.port}/`

  console.log(`[windbell-desktop] api listening at ${state.appUrl}`)
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
