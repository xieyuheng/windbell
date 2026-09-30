import { errorReport } from "@xieyuheng/std.js/error"
import type { Database } from "../database/index.ts"
import { formatSign } from "../format/index.ts"
import type { Repl } from "../repl/Repl.ts"
import { ErrorSign } from "../sign/index.ts"
import type { Session } from "../session/index.ts"

export function makeTitleChangeHandler(
  database: Database,
  session: Session,
): (title: string) => Promise<void> {
  return async (title) => {
    await database.sessions.updateTitle(session.id, title)
    session.title = title
  }
}

export function printAgentReplError(repl: Repl, error: unknown): void {
  repl.println(
    formatSign(ErrorSign(errorReport(error)), { color: repl.useColor }),
  )
}
