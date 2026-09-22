import type { Sign } from "../sign/index.ts"

export type Model = {
  interpret: ModelInterpret
}

export type ModelInterpret = (input: ModelInput) => Promise<ModelOutput>

export type ModelInput = ReadonlyArray<Sign>

export type ModelOutput = Array<Sign>
