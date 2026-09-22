import type { Context } from "./Context.ts"
import type { Sign } from "../sign/index.ts"

export type Model = {
  interpret: ModelInterpret
}

export type ModelInterpret = (input: ModelInput) => Promise<ModelOutput>

export type ModelInput = {
  context: Context
}

export type ModelOutput = {
  sign: Sign
}
