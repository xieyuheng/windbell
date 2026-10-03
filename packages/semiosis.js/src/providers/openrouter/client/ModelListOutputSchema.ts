import { z } from "zod"
import { ModelInfoSchema } from "./ModelInfoSchema.ts"

const LinksSchema = z.object({
  next: z.string().nullable().optional(),
})

export const ModelListOutputSchema = z.object({
  data: z.array(ModelInfoSchema),
  total_count: z.number().optional(),
  links: LinksSchema.optional(),
})

export type ModelListOutput = z.infer<typeof ModelListOutputSchema>
