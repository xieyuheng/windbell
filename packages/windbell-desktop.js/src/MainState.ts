import type { BrowserWindow } from "electron"
import { type ServerType } from "@hono/node-server"

export type MainState = {
  mainWindow: BrowserWindow | undefined
  appServer: ServerType | undefined
  appUrl: string | undefined
}

export function makeMainState(): MainState {
  return {
    mainWindow: undefined,
    appServer: undefined,
    appUrl: undefined,
  }
}
