import { app, BrowserWindow, shell } from "electron"
import * as S from "@xieyuheng/semiosis.js"
import {
  closeServer,
  startWindbellServer,
  type ServeResult,
} from "@xieyuheng/windbell-api.js"
import Path from "node:path"
import { fileURLToPath } from "node:url"

const HOSTNAME = "127.0.0.1"
const PORT = 17344

const dirname = Path.dirname(fileURLToPath(import.meta.url))

let apiServer: ServeResult["server"] | undefined
let apiOrigin: string | undefined
let mainWindow: BrowserWindow | undefined

function resolveWebDistRoot(): string {
  if (app.isPackaged) {
    return Path.join(process.resourcesPath, "web")
  }

  return (
    process.env.WINDBELL_WEB_DIST ??
      Path.resolve(dirname, "../../windbell-web.js/dist")
  )
}

async function startApiServer(): Promise<void> {
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

  apiServer = server
  apiOrigin = `http://${HOSTNAME}:${info.port}/`

  console.log(`[windbell-desktop] api listening at ${apiOrigin}`)
}

async function createWindow(): Promise<void> {
  const url = apiOrigin ?? `http://${HOSTNAME}:${PORT}/`

  console.log("[windbell-desktop] creating window")

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Windbell",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.on("closed", () => {
    mainWindow = undefined
  })

  mainWindow.once("ready-to-show", () => {
    console.log("[windbell-desktop] window ready to show")
  })

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `[windbell-desktop] did-fail-load ${errorCode} ${errorDescription} ${validatedURL}`,
      )
    },
  )

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error(`[windbell-desktop] render-process-gone ${details.reason}`)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: "deny" }
  })

  console.log(`[windbell-desktop] loading ${url}`)

  await mainWindow.loadURL(url)

  console.log("[windbell-desktop] window loaded")
}

async function main(): Promise<void> {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
    return
  }

  app.on("second-instance", () => {
    if (mainWindow === undefined) return

    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow()
    }
  })

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })

  app.on("before-quit", () => {
    if (apiServer === undefined) return

    void closeServer(apiServer).catch((error) => {
      console.error("[windbell-desktop] failed to close api server:", error)
    })
  })

  console.log("[windbell-desktop] waiting for app ready")

  await app.whenReady()

  console.log("[windbell-desktop] app ready")

  await startApiServer()
  await createWindow()
}

void main().catch((error) => {
  console.error("[windbell-desktop] failed to start:", error)
  app.quit()
})
