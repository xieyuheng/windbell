import { app, BrowserWindow } from "electron"
import { closeServer } from "@xieyuheng/windbell-api.js"
import { createWindow } from "./createWindow.ts"
import { makeMainState, type MainState } from "./MainState.ts"
import { startApiServer } from "./startApiServer.ts"

async function main(): Promise<void> {
  const state = makeMainState()
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
    } else  {
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
