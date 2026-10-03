import { BrowserWindow, shell } from "electron"
import type { MainState } from "./MainState.ts"

export async function createWindow(state: MainState): Promise<void> {
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
}
