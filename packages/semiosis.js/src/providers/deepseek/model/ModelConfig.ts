export type ModelConfig = {
  name: string
  disabled: boolean
  thinking: "enabled" | "disabled"
  reasoningEffort: "none" | "low" | "high" | "max"
}
