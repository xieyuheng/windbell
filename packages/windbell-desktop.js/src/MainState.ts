import type { BrowserWindow } from "electron"
import { type ServerType } from "@hono/node-server"

export type MainState = {
  mainWindow?: BrowserWindow
  appServer?: ServerType
  appUrl?: string
}

export function makeMainState(): MainState {
  return {}
}
