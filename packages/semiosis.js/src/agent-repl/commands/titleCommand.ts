import type { ReplCommand } from "../../repl/Repl.ts"

export function titleCommand(
  generateAndPrintTitle: () => Promise<void>,
): ReplCommand {
  return {
    name: "title",
    handler: async () => {
      await generateAndPrintTitle()
    },
  }
}
