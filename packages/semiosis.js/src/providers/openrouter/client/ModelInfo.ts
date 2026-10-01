export type ModelInfo = {
  id: string
  canonical_slug?: string | null
  hugging_face_id?: string | null
  name: string
  created?: number
  description?: string
  context_length: number
  architecture: {
    modality?: string
    input_modalities: Array<string>
    output_modalities: Array<string>
    tokenizer?: string | null
    instruct_type?: string | null
  }
  pricing: Record<string, unknown>
  top_provider?: {
    context_length?: number | null
    max_completion_tokens?: number | null
    is_moderated?: boolean
  } | null
  per_request_limits?: unknown
  supported_parameters: Array<string>
  default_parameters?: Record<string, unknown> | null
  supported_voices?: unknown
  knowledge_cutoff?: string | null
  expiration_date?: string | null
  links?: {
    details?: string
  } | null
  reasoning?: {
    mandatory?: boolean
    default_enabled?: boolean
    supported_efforts?: Array<string>
    default_effort?: string | null
  } | null
}
