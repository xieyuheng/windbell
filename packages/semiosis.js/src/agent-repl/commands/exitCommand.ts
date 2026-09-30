import type { ReplCommand } from "../../repl/Repl.ts"

export function exitCommand(): ReplCommand {
  return {
    name: "exit",
    handler: ({ repl }) => {
      repl.close()
    },
  }
}
