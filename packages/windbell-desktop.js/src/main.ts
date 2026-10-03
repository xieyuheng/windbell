import { app, BrowserWindow } from "electron"
import { closeServer } from "@xieyuheng/windbell-api.js"
import { createWindow } from "./createWindow.ts"
import { makeMainState, type MainState } from "./MainState.ts"
import { startAppServer } from "./startAppServer.ts"

async function main(): Promise<void> {
  const state = makeMainState()
  const hostname = "127.0.0.1"
  const port = 17344
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
    return
  }

  app.on("second-instance", () => {
    const window = state.mainWindow
    if (window === undefined || window.isDestroyed()) return
    if (window.isMinimized()) window.restore()
    window.focus()
  })

  app.on("window-all-closed", () => {
    if (process.platform === "darwin") {
      return
    } else {
      app.quit()
    }
  })

  app.on("before-quit", () => {
    if (state.appServer === undefined) return

    void closeServer(state.appServer).catch((error) => {
      console.error("[windbell-desktop] failed to close app server:", error)
    })
  })

  console.log("[windbell-desktop] waiting for app ready")

  await app.whenReady()

  console.log("[windbell-desktop] app ready")

  await startAppServer(state, { hostname, port })
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
