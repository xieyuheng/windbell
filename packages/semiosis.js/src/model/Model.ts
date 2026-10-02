import type { Sign } from "../sign/index.ts"
import type { ModelRef } from "./ModelRef.ts"

export type Model = ModelRef & {
  interpret: (input: Array<Sign>) => Promise<Array<Sign>>
}
