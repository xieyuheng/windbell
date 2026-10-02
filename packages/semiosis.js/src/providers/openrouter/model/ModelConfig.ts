import type { Reasoning } from "../client/index.ts"

export type ModelConfig = {
  name: string
  reasoning?: Reasoning | null
  provider?: Record<string, unknown> | null
  extraBody?: Record<string, unknown>
}
