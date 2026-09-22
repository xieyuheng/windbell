import { makeToolRouter, type ToolRouter } from "../tool/index.ts"
import { makeBashToolHandler, makeBashToolSign } from "./index.ts"

const defaultBashToolDescription = `Run commands in a bash shell.
* When invoking this tool, the contents of the "command" parameter does NOT need to be XML-escaped.
* Network access depends on the task environment. Prefer configured mirrors/proxies when they are available.
* Shell state is not persistent across calls. Use \`cd <dir> && <command>\` when you need a specific working directory.
* To inspect a particular line range of a file, e.g. lines 10-25, try 'sed -n 10,25p /path/to/the/file'.
* Please avoid commands that may produce a very large amount of output.`

export function makeDefaultToolRouter(): ToolRouter {
  const toolRouter = makeToolRouter()

  toolRouter.defineTool(
    makeBashToolSign({
      description: defaultBashToolDescription,
    }),
    makeBashToolHandler({
      timeoutMs: 300_000,
      maxOutputChars: 200_000,
    }),
  )

  return toolRouter
}
