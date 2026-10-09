import { agentContinue, agentInterpret } from "../agent/agentInterpret.ts"
import type { Agent } from "../agent/Agent.ts"
import type { SessionStore } from "../database/SessionStore.ts"
import type { Sign } from "../sign/index.ts"
import type { Turn } from "./Turn.ts"
import type { TurnEvent } from "./TurnEvent.ts"
import { replayTurn } from "./replayTurn.ts"

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export type RunTurnOptions = {
  sessions: SessionStore
  agent: Agent
  turn: Turn
  input: Array<Sign>
  signal?: AbortSignal
  isRetryable?: (error: unknown) => boolean
}

export async function* runTurn(
  options: RunTurnOptions,
): AsyncGenerator<TurnEvent> {
  const { sessions, agent, input, signal } = options
  const turn: Turn = { ...options.turn }

  try {
    for await (const sign of replayTurn({ sessions, turn })) {
      yield { type: "sign", sign }
    }

    const interpreter = turn.inputPersisted
      ? agentContinue(agent, { signal })
      : agentInterpret(agent, input, { signal })

    for await (const event of interpreter) {
      if (event.type === "input-persisted") {
        turn.inputPersisted = true
        turn.endSequence = await sessions.nextSignSequence(turn.sessionId)
        turn.updatedAt = Date.now()
        await sessions.putTurn(turn)
        continue
      }

      turn.endSequence = await sessions.nextSignSequence(turn.sessionId)
      turn.updatedAt = Date.now()
      await sessions.putTurn(turn)

      yield { type: "sign", sign: event.sign }
    }

    turn.status = "completed"
    turn.completedAt = Date.now()
    turn.endSequence = await sessions.nextSignSequence(turn.sessionId)
    turn.updatedAt = Date.now()
    await sessions.putTurn(turn)
  } catch (error) {
    turn.status = "failed"
    turn.error = { message: errorMessage(error) }
    turn.endSequence = await sessions.nextSignSequence(turn.sessionId)
    turn.updatedAt = Date.now()
    await sessions.putTurn(turn)

    yield {
      type: "error",
      message: errorMessage(error),
      retryable: options.isRetryable?.(error) ?? false,
      inputPersisted: turn.inputPersisted,
    }
  }
}
