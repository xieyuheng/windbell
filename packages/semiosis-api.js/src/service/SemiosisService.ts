import type { Database } from "@xieyuheng/semiosis.js"

export type SemiosisServiceOptions = {
  database: Database
}

export type SemiosisService = {
  workspaces: Database["workspaces"]
  sessions: Database["sessions"]
}

export function makeSemiosisService(
  options: SemiosisServiceOptions,
): SemiosisService {
  return {
    workspaces: options.database.workspaces,
    sessions: options.database.sessions,
  }
}
