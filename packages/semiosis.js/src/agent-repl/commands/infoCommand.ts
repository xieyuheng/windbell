import type { ReplCommand } from "../../repl/Repl.ts"

export function infoCommand(onInfo?: () => Promise<void> | void): ReplCommand {
  return {
    name: "info",
    handler: async () => {
      await onInfo?.()
    },
  }
}
