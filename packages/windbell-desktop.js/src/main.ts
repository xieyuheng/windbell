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

type MainState = {
  mainWindow: BrowserWindow | undefined
  apiServer: ServeResult["server"] | undefined
  appUrl: string | undefined
}

function makeMainState(): MainState {
  return {
    mainWindow: undefined,
    apiServer: undefined,
    appUrl: undefined,
  }
}

function resolveWebDistRoot(): string {
  if (app.isPackaged) {
    return Path.join(process.resourcesPath, "web")
  }

  return (
    process.env.WINDBELL_WEB_DIST ??
    Path.resolve(dirname, "../../windbell-web.js/dist")
  )
}

async function startApiServer(state: MainState): Promise<void> {
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

async function createWindow(state: MainState): Promise<BrowserWindow> {
  const appUrl = state.appUrl

  if (appUrl === undefined) {
    throw new Error(
      "[windbell-desktop] app url is not initialized; call startApiServer first",
    )
  }

  console.log("[windbell-desktop] creating window")

  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Windbell",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  state.mainWindow = window

  window.on("closed", () => {
    if (state.mainWindow === window) {
      state.mainWindow = undefined
    }
  })

  window.once("ready-to-show", () => {
    console.log("[windbell-desktop] window ready to show")
  })

  window.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `[windbell-desktop] did-fail-load ${errorCode} ${errorDescription} ${validatedURL}`,
      )
    },
  )

  window.webContents.on("render-process-gone", (_event, details) => {
    console.error(`[windbell-desktop] render-process-gone ${details.reason}`)
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: "deny" }
  })

  console.log(`[windbell-desktop] loading ${appUrl}`)

  await window.loadURL(appUrl)

  console.log("[windbell-desktop] window loaded")

  return window
}

function focusMainWindow(state: MainState): void {
  const window = state.mainWindow

  if (window === undefined || window.isDestroyed()) return

  if (window.isMinimized()) window.restore()

  window.focus()
}

async function main(): Promise<void> {
  const state = makeMainState()
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
    return
  }

  app.on("second-instance", () => {
    focusMainWindow(state)
  })

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })

  app.on("before-quit", () => {
    if (state.apiServer === undefined) return

    void closeServer(state.apiServer).catch((error) => {
      console.error("[windbell-desktop] failed to close api server:", error)
    })
  })

  console.log("[windbell-desktop] waiting for app ready")

  await app.whenReady()

  console.log("[windbell-desktop] app ready")

  await startApiServer(state)
  await createWindow(state)

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow(state)
    }
  })
}

void main().catch((error) => {
  console.error("[windbell-desktop] failed to start:", error)
  app.quit()
})
