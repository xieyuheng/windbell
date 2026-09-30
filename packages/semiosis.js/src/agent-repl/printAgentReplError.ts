import { errorReport } from "@xieyuheng/std.js/error"
import { formatSign } from "../format/index.ts"
import { ErrorSign } from "../sign/index.ts"
import type { Repl } from "../repl/Repl.ts"

export function printAgentReplError(repl: Repl, error: unknown): void {
  repl.println(
    formatSign(ErrorSign(errorReport(error)), { color: repl.useColor }),
  )
}
