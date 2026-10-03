import type { BrowserWindow } from "electron"
import type { ServeResult } from "@xieyuheng/windbell-api.js"

export type MainState = {
  mainWindow: BrowserWindow | undefined
  appServer: ServeResult["server"] | undefined
  appUrl: string | undefined
}

export function makeMainState(): MainState {
  return {
    mainWindow: undefined,
    appServer: undefined,
    appUrl: undefined,
  }
}
