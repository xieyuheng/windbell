import { z } from "zod"
import { ModelInfoSchema } from "./ModelInfoSchema.ts"

const LinksSchema = z.strictObject({
  next: z.string().nullable().optional(),
})

export const ModelListOutputSchema = z.strictObject({
  data: z.array(ModelInfoSchema),
  total_count: z.number().optional(),
  links: LinksSchema.optional(),
})

export type ModelListOutput = z.infer<typeof ModelListOutputSchema>
