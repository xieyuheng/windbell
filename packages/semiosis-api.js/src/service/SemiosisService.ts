import type * as S from "@xieyuheng/semiosis.js"

export type SemiosisServiceOptions = {
  database: S.Database
}

export type SemiosisService = {
  workspaces: S.Database["workspaces"]
  sessions: S.Database["sessions"]
}

export function makeSemiosisService(
  options: SemiosisServiceOptions,
): SemiosisService {
  return {
    workspaces: options.database.workspaces,
    sessions: options.database.sessions,
  }
}
