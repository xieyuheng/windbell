import type { Database } from "@xieyuheng/semiosis.js"

export type SemiosisServerOptions = {
  database?: Database
  hostname?: string
  port?: number
  basePath?: string
}
