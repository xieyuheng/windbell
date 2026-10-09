import type { Sign } from "../sign/index.ts"

export type TurnEvent =
  | { type: "sign"; sign: Sign }
  | {
      type: "error"
      error: unknown
      inputPersisted: boolean
    }
