import { agentContinue, agentInterpret } from "../agent/agentInterpret.ts"
import type { Agent } from "../agent/Agent.ts"
import type { SessionStore } from "../database/SessionStore.ts"
import type { Sign } from "../sign/index.ts"
import type { Turn } from "./Turn.ts"
import type { TurnEvent } from "./TurnEvent.ts"

export type RunTurnOptions = {
  sessions: SessionStore
  agent: Agent
  turn: Turn
  input: Array<Sign>
  signal?: AbortSignal
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function* runTurn(
  options: RunTurnOptions,
): AsyncGenerator<TurnEvent> {
  const { sessions, agent, input, signal } = options
  const turn: Turn = { ...options.turn }

  const interpreter = turn.inputPersisted
    ? agentContinue(agent, { signal })
    : agentInterpret(agent, input, { signal })

  const inputSigns = new Set(input)

  for await (const event of interpreter) {
    if (event.type === "error") {
      turn.status = "failed"
      turn.error = errorMessage(event.error)
      turn.inputPersisted = event.inputPersisted
      turn.endSequence = await sessions.nextSignSequence(turn.sessionId)
      turn.updatedAt = Date.now()
      await sessions.putTurn(turn)

      yield {
        type: "error",
        error: event.error,
        inputPersisted: event.inputPersisted,
      }
      return
    }

    if (!turn.inputPersisted && inputSigns.has(event.sign)) {
      turn.inputPersisted = true
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
}
