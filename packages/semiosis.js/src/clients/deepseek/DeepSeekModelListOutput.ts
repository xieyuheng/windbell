import type { DeepSeekModelInfo } from "./DeepSeekModelInfo.ts"

export type DeepSeekModelListOutput = {
  object: "list"
  data: Array<DeepSeekModelInfo>
}
