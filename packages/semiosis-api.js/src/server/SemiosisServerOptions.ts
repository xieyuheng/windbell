import type * as S from "@windbell/semiosis.js"

export type SemiosisServerOptions = {
  database: S.Database
  hostname: string
  port: number
  basePath: string
}
