import type { Sign } from "../sign/index.ts"

export type Model = {
  interpret: (input: Array<Sign>) => Promise<Array<Sign>>
}
