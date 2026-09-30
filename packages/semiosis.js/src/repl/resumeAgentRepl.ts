import { loadSession, type SessionId } from "../session/index.ts"
import { runAgentRepl } from "./runAgentRepl.ts"
import {
  makeAgentForRepl,
  makeInfoPrinter,
  makeReplToolRouter,
  makeTitleChangeHandler,
  type AgentReplOptions,
} from "./shared.ts"

export type ResumeAgentReplOptions = AgentReplOptions & {
  sessionId: SessionId
}

export async function resumeAgentRepl(
  options: ResumeAgentReplOptions,
): Promise<void> {
  const toolRouter = makeReplToolRouter(options)
  const session = await loadSession({
    database: options.database,
    workspace: options.workspace,
    sessionId: options.sessionId,
  })
  const agent = await makeAgentForRepl(options, session, toolRouter)

  await runAgentRepl(agent, {
    showContext: true,
    onInfo: makeInfoPrinter(options, agent, session),
    onTitleChange: makeTitleChangeHandler(options.database, session),
  })
}
