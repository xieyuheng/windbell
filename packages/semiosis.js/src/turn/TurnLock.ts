import type { SessionId } from "../session/Session.ts"
import { TurnAlreadyRunningError } from "./TurnError.ts"
import type { TurnId } from "./Turn.ts"

export class TurnLock {
  private running = new Set<string>()

  tryLock(sessionId: SessionId, turnId: TurnId): () => void {
    const key = `${sessionId}:${turnId}`

    if (this.running.has(key)) {
      throw new TurnAlreadyRunningError(turnId)
    }

    this.running.add(key)

    return () => {
      this.running.delete(key)
    }
  }
}
