export type DeepSeekModelInfo = {
  id: string
  object: "model"
  owned_by: string
  name: string
  context_window: number
  max_output_tokens: number
  input_modalities: Array<string>
  output_modalities: Array<string>
  effort?: {
    supported_levels: Array<string>
    default_level?: string
  }
  api_capabilities?: Record<string, unknown>
}
