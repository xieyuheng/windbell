import { z } from "zod"

const modelInfoSchema = z.looseObject({
  id: z.string(),
  object: z.literal("model"),
  owned_by: z.string(),
  name: z.string(),
  context_window: z.number(),
  max_output_tokens: z.number(),
  input_modalities: z.array(z.string()),
  output_modalities: z.array(z.string()),
  effort: z
    .object({
      supported_levels: z.array(z.string()),
      default_level: z.string().optional(),
    })
    .optional(),
  api_capabilities: z.record(z.string(), z.unknown()).optional(),
})

export const modelListOutputSchema = z.looseObject({
  object: z.literal("list"),
  data: z.array(modelInfoSchema),
})

export type ModelListOutput = z.infer<typeof modelListOutputSchema>
