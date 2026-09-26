import type * as S from "@xieyuheng/semiosis.js"

export type SemiosisServiceOptions = {
  database: S.Database
}

export type SemiosisService = {
  workspaces: S.Database["workspaces"]
  sessions: S.Database["sessions"]
  dustbin: {
    sessions: S.Database["dustbin"]["sessions"]
  }
}

export function makeSemiosisService(
  options: SemiosisServiceOptions,
): SemiosisService {
  return {
    workspaces: options.database.workspaces,
    sessions: options.database.sessions,
    dustbin: {
      sessions: options.database.dustbin.sessions,
    },
  }
}
