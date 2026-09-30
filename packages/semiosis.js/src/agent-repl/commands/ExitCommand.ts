import type { Repl, ReplCommand } from "../../repl/Repl.ts"

export function makeExitCommand(repl: Repl): ReplCommand {
  return {
    name: "exit",
    handler: () => {
      repl.close()
    },
  }
}
