import type { Agent } from "../../agent/index.ts"
import type { Database } from "../../database/index.ts"
import type { Model } from "../../model/index.ts"
import type { Repl, ReplCommand } from "../../repl/Repl.ts"
import type { Session } from "../../session/index.ts"
import type { Workspace } from "../../workspace/Workspace.ts"

export function makeInfoCommand(
  agent: Agent,
  repl: Repl,
  options: {
    database: Database
    workspace: Workspace
    model: Model
    session: Session
  },
): ReplCommand {
  return {
    name: "info",
    description: "show session information",
    handler: async () => {
      const context = await agent.getContext()

      repl.println(`database: ${options.database.root}`)
      repl.println(`model: ${options.model.qualifiedName}`)
      repl.println(`workspace: ${options.workspace.name}`)
      repl.println(`  root: ${options.workspace.root}`)
      repl.println(`session: ${options.session.title}`)
      repl.println(`  id: ${options.session.id}`)
      repl.println(`  context.length: ${context.length}`)
      repl.println("")
    },
  }
}
