import type { TurnId } from "./Turn.ts"

export class TurnInputMismatchError extends Error {
  turnId: TurnId

  constructor(turnId: TurnId) {
    super(`turn input mismatch: ${turnId}`)
    this.name = "TurnInputMismatchError"
    this.turnId = turnId
  }
}

export class TurnModelMismatchError extends Error {
  turnId: TurnId

  constructor(turnId: TurnId) {
    super(`turn model mismatch: ${turnId}`)
    this.name = "TurnModelMismatchError"
    this.turnId = turnId
  }
}

export class TurnAlreadyRunningError extends Error {
  turnId: TurnId

  constructor(turnId: TurnId) {
    super(`turn is already running: ${turnId}`)
    this.name = "TurnAlreadyRunningError"
    this.turnId = turnId
  }
}
