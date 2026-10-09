import type { Sign, SignDelta } from "../sign/index.ts"
import type { ModelRef } from "./ModelRef.ts"

export type ModelInterpretOptions = {
  signal?: AbortSignal
}

export type ModelInterpretEvent =
  { type: "delta"; delta: SignDelta } | { type: "sign"; sign: Sign }

export type Model = ModelRef & {
  interpret: (
    input: Array<Sign>,
    options?: ModelInterpretOptions,
  ) => AsyncIterable<ModelInterpretEvent>
}
