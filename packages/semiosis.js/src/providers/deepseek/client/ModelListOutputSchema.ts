import { z } from "zod"
import { ModelInfoSchema } from "./ModelInfoSchema.ts"

export const ModelListOutputSchema = z.object({
  object: z.literal("list"),
  data: z.array(ModelInfoSchema),
})

export type ModelListOutput = z.infer<typeof ModelListOutputSchema>
