import type { ModelInfo } from "./ModelInfo.ts"

export type ModelListOutput = {
  object: "list"
  data: Array<ModelInfo>
}
