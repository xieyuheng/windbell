import type { Sign } from "../sign/index.ts"

export type Model = {
  qualifiedName: string
  interpret: (input: Array<Sign>) => Promise<Array<Sign>>
}
