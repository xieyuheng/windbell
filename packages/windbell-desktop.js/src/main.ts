import { app, BrowserWindow, shell } from "electron"
import * as S from "@xieyuheng/semiosis.js"
import { startWindbellServer } from "@xieyuheng/windbell-api.js"
import Path from "node:path"
import { fileURLToPath } from "node:url"

const HOSTNAME = "127.0.0.1"
const PORT = 17344

const dirname = Path.dirname(fileURLToPath(import.meta.url))

let apiServer: ReturnType<typeof startWindbellServer> | undefined
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

  apiServer = startWindbellServer({
    database,
    hostname: HOSTNAME,
    port: PORT,
    corsOrigin: undefined,
    webDistRoot: resolveWebDistRoot(),
  })

  if (apiServer.listening) return

  await new Promise<void>((resolve, reject) => {
    apiServer?.once("listening", () => resolve())
    apiServer?.once("error", reject)
  })
}

async function createWindow(): Promise<void> {
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: "deny" }
  })

  await mainWindow.loadURL(`http://${HOSTNAME}:${PORT}/`)
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow === undefined) return

    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app
    .whenReady()
    .then(async () => {
      await startApiServer()
      await createWindow()

      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          void createWindow()
        }
      })
    })
    .catch((error) => {
      console.error("[windbell-desktop] failed to start:", error)
      app.quit()
    })

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
  })

  app.on("before-quit", () => {
    apiServer?.close()
  })
}
