import type { SessionStore } from "../database/SessionStore.ts"
import type { Sign } from "../sign/index.ts"
import type { Turn } from "./Turn.ts"

export type ReplayTurnOptions = {
  sessions: SessionStore
  turn: Turn
}

export async function* replayTurn(
  options: ReplayTurnOptions,
): AsyncGenerator<Sign> {
  const signs = await options.sessions.sliceContextBySequence(
    options.turn.sessionId,
    options.turn.startSequence,
    options.turn.endSequence,
  )

  yield* signs
}
