import { createHash } from "node:crypto"
import type { ModelRef } from "../model/index.ts"
import type { Sign } from "../sign/index.ts"
import type { SessionId } from "../session/Session.ts"

export type TurnId = string

export type TurnStatus = "pending" | "completed" | "failed" | "cancelled"

export type Turn = {
  id: TurnId
  sessionId: SessionId

  status: TurnStatus
  model: ModelRef

  inputHash: string
  inputPersisted: boolean

  startSequence: number
  endSequence: number

  error?: string

  createdAt: number
  updatedAt: number
  completedAt?: number
}

export function makeInputHash(input: Array<Sign>): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex")
}
