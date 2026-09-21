import type { FileSystemRouterOptions } from "../router/index.ts"

export type FileSystemServerOptions = FileSystemRouterOptions & {
  host?: string
  port?: number
  basePath?: string
}
