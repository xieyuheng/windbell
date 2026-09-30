import type { ReplCommand } from "../../repl/Repl.ts"

export function makeExitCommand(): ReplCommand {
  return {
    name: "exit",
    handler: ({ repl }) => {
      repl.close()
    },
  }
}
